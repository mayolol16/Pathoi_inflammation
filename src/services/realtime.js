import { getFirebaseConfig } from '../config/firebaseConfig.js';
import { getOrCreateClientId } from './storage.js';

const CHANNEL_NAME = 'imc530-pathology-live';
const LOCAL_ROOM_PREFIX = 'imc530_room_';

export function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function defaultRoomData(code) {
  return {
    code,
    state: {
      view: 'orient', // 'orient' | 'case'
      orientIdx: 0,
      orientPair: 'normal',
      caseIdx: 0,
      stage: 0, // 0 vignette, 1 vote, 2 slide reveal, 3 discussion
      pollStatus: 'open', // 'open' | 'closed' | 'revealed'
      pacingMode: 'instructor', // 'instructor' | 'free'
      bypassWarmup: false,
      spotlightZoneId: null,
      spotlightReasoningId: null,
      updatedAt: Date.now(),
    },
    polls: {},
    presence: {},
    mediaOverrides: {},
  };
}

/**
 * Dual-transport RoomSession:
 * - Firebase Realtime Database when configured (multi-device lecture hall)
 * - Automatic BroadcastChannel + localStorage fallback (zero-config multi-tab testing)
 */
export class RoomSession {
  constructor() {
    this.roomCode = null;
    this.role = 'student';
    this.clientId = null;
    this.displayName = 'Student';
    this.transport = 'local'; // 'firebase' | 'local'
    this.listeners = new Set();
    this.unsubscribers = [];
    this.channel = null;
    this.heartbeatTimer = null;
    this.roomData = null;
    this._db = null;
    this._fbMod = null;
    this._fbConfigKey = null;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    if (this.roomData) fn(this.getSnapshot());
    return () => this.listeners.delete(fn);
  }

  emit() {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  getSnapshot() {
    const rawPresence = this.roomData?.presence || {};
    const now = Date.now();
    const activeStudents = Object.entries(rawPresence)
      .filter(([, p]) => p && p.role === 'student' && (this.transport === 'firebase' || now - (p.lastSeen || 0) < 45000))
      .map(([id, p]) => ({ id, ...p }));

    return {
      connected: Boolean(this.roomCode),
      roomCode: this.roomCode,
      transport: this.transport,
      state: this.roomData?.state || defaultRoomData('').state,
      polls: this.roomData?.polls || {},
      mediaOverrides: this.roomData?.mediaOverrides || {},
      studentCount: activeStudents.length,
      students: activeStudents,
    };
  }

  getVoteSummary(caseId, hypotheses = []) {
    const votesMap = this.roomData?.polls?.[caseId]?.votes || {};
    const counts = {};
    hypotheses.forEach((h) => { counts[h.key] = 0; });
    const entries = [];
    Object.entries(votesMap).forEach(([studentId, v]) => {
      if (!v || !v.choice) return;
      counts[v.choice] = (counts[v.choice] || 0) + 1;
      entries.push({
        id: studentId,
        choice: v.choice,
        reasoning: v.reasoning || '',
        studentName: v.studentName || 'Anonymous',
        ts: v.ts || 0,
      });
    });
    entries.sort((a, b) => b.ts - a.ts);
    const total = entries.length;
    const myVote = this.clientId ? votesMap[this.clientId] || null : null;
    return { counts, total, entries, myVote };
  }

  async _initFirebase() {
    const cfg = getFirebaseConfig();
    if (!cfg) return false;
    const cfgKey = JSON.stringify({
      apiKey: cfg.apiKey,
      databaseURL: cfg.databaseURL,
      projectId: cfg.projectId,
      appId: cfg.appId,
    });
    try {
      const [{ initializeApp, getApps, deleteApp }, dbMod] = await Promise.all([
        import('firebase/app'),
        import('firebase/database'),
      ]);
      const existing = getApps().find((a) => a.name === 'imc530');
      if (existing && this._fbConfigKey && this._fbConfigKey !== cfgKey) {
        await deleteApp(existing);
      }
      const current = getApps().find((a) => a.name === 'imc530');
      const app = current || initializeApp(cfg, 'imc530');
      this._fbConfigKey = cfgKey;
      this._db = dbMod.getDatabase(app);
      this._fbMod = dbMod;
      this.transport = 'firebase';
      return true;
    } catch (err) {
      console.warn('Firebase init failed, falling back to Local Multi-Tab Sync:', err);
      this.transport = 'local';
      return false;
    }
  }

  async connect(code, role = 'student', displayName = 'Student', createIfMissing = false) {
    this.disconnect();
    const cleanCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanCode) throw new Error('Please enter a valid room code.');

    this.roomCode = cleanCode;
    this.role = role;
    this.displayName = displayName || (role === 'instructor' ? 'Instructor' : 'Student');
    this.clientId = getOrCreateClientId(role === 'instructor' ? 'inst' : 'stu');

    const fbReady = await this._initFirebase();
    if (fbReady) {
      await this._connectFirebase(cleanCode, createIfMissing);
    } else {
      this._connectLocal(cleanCode, createIfMissing);
    }
    return this.getSnapshot();
  }

  async _connectFirebase(code, createIfMissing) {
    const { ref, onValue, set, get, onDisconnect } = this._fbMod;
    const roomRef = ref(this._db, `rooms/${code}`);
    const stateRef = ref(this._db, `rooms/${code}/state`);

    if (createIfMissing) {
      const snap = await get(stateRef);
      if (!snap.exists()) {
        await set(stateRef, defaultRoomData(code).state);
      }
    }

    const presRef = ref(this._db, `rooms/${code}/presence/${this.clientId}`);
    await set(presRef, {
      role: this.role,
      name: this.displayName,
      lastSeen: Date.now(),
    });
    onDisconnect(presRef).remove();

    const unsub = onValue(roomRef, (snapshot) => {
      const val = snapshot.val();
      this.roomData = val || defaultRoomData(code);
      this.emit();
    });
    this.unsubscribers.push(unsub);
  }

  _readLocalRoom(code) {
    try {
      const raw = localStorage.getItem(LOCAL_ROOM_PREFIX + code);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _writeLocalRoom(data) {
    if (!this.roomCode) return;
    localStorage.setItem(LOCAL_ROOM_PREFIX + this.roomCode, JSON.stringify(data));
    this.roomData = data;
    if (this.channel) {
      this.channel.postMessage({ type: 'room_update', code: this.roomCode, data });
    }
    this.emit();
  }

  _connectLocal(code, createIfMissing) {
    this.transport = 'local';
    let existing = this._readLocalRoom(code);
    if (!existing) {
      existing = defaultRoomData(code);
      if (createIfMissing || this.role === 'instructor') {
        localStorage.setItem(LOCAL_ROOM_PREFIX + code, JSON.stringify(existing));
      }
    }
    this.roomData = existing;

    const writePresence = () => {
      const cur = this._readLocalRoom(code) || defaultRoomData(code);
      cur.presence = cur.presence || {};
      cur.presence[this.clientId] = {
        role: this.role,
        name: this.displayName,
        lastSeen: Date.now(),
      };
      this._writeLocalRoom(cur);
    };
    writePresence();
    this.heartbeatTimer = setInterval(writePresence, 12000);

    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (ev) => {
        if (ev.data?.type === 'room_update' && ev.data?.code === this.roomCode) {
          this.roomData = ev.data.data;
          this.emit();
        }
      };
    }

    const onStorage = (ev) => {
      if (ev.key === LOCAL_ROOM_PREFIX + this.roomCode && ev.newValue) {
        try {
          this.roomData = JSON.parse(ev.newValue);
          this.emit();
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    this.unsubscribers.push(() => window.removeEventListener('storage', onStorage));

    const onBeforeUnload = () => {
      const cur = this._readLocalRoom(code);
      if (cur?.presence?.[this.clientId]) {
        delete cur.presence[this.clientId];
        localStorage.setItem(LOCAL_ROOM_PREFIX + code, JSON.stringify(cur));
        if (this.channel) {
          this.channel.postMessage({ type: 'room_update', code, data: cur });
        }
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    this.unsubscribers.push(() => window.removeEventListener('beforeunload', onBeforeUnload));
    this.emit();
  }

  disconnect() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.unsubscribers.forEach((fn) => {
      try { fn(); } catch { /* ignore */ }
    });
    this.unsubscribers = [];
    this.roomCode = null;
    this.roomData = null;
    this.emit();
  }

  async updateRoomState(patch) {
    if (!this.roomCode) return;
    const nextState = {
      ...(this.roomData?.state || defaultRoomData(this.roomCode).state),
      ...patch,
      updatedAt: Date.now(),
    };
    if (this.transport === 'firebase' && this._fbMod) {
      const { ref, update } = this._fbMod;
      await update(ref(this._db, `rooms/${this.roomCode}/state`), nextState);
    } else {
      const cur = this._readLocalRoom(this.roomCode) || defaultRoomData(this.roomCode);
      cur.state = nextState;
      this._writeLocalRoom(cur);
    }
  }

  async submitVote(caseId, choice, reasoning = '', studentName = 'Student') {
    if (!this.roomCode) return;
    const payload = {
      choice,
      reasoning: String(reasoning || '').trim(),
      studentName: String(studentName || 'Student').trim() || 'Student',
      ts: Date.now(),
    };
    if (this.transport === 'firebase' && this._fbMod) {
      const { ref, set } = this._fbMod;
      await set(ref(this._db, `rooms/${this.roomCode}/polls/${caseId}/votes/${this.clientId}`), payload);
    } else {
      const cur = this._readLocalRoom(this.roomCode) || defaultRoomData(this.roomCode);
      cur.polls = cur.polls || {};
      cur.polls[caseId] = cur.polls[caseId] || { votes: {} };
      cur.polls[caseId].votes[this.clientId] = payload;
      this._writeLocalRoom(cur);
    }
  }

  async resetPoll(caseId) {
    if (!this.roomCode) return;
    if (this.transport === 'firebase' && this._fbMod) {
      const { ref, remove } = this._fbMod;
      await remove(ref(this._db, `rooms/${this.roomCode}/polls/${caseId}`));
    } else {
      const cur = this._readLocalRoom(this.roomCode) || defaultRoomData(this.roomCode);
      if (cur.polls) delete cur.polls[caseId];
      this._writeLocalRoom(cur);
    }
  }

  async simulateVotes(caseId, demoDist, sampleReasonings = {}) {
    if (!this.roomCode) return;
    const simulatedVotes = {};
    let idx = 1;
    Object.entries(demoDist).forEach(([choice, pct]) => {
      const n = Math.max(1, Math.round(pct / 5)); // ~20 simulated students
      for (let i = 0; i < n; i++) {
        const id = `sim_${idx++}`;
        simulatedVotes[id] = {
          choice,
          reasoning: i === 0 && sampleReasonings[choice] ? sampleReasonings[choice] : '',
          studentName: `Demo Student ${idx - 1}`,
          ts: Date.now() - idx * 1000,
        };
      }
    });

    if (this.transport === 'firebase' && this._fbMod) {
      const { ref, set } = this._fbMod;
      await set(ref(this._db, `rooms/${this.roomCode}/polls/${caseId}/votes`), simulatedVotes);
    } else {
      const cur = this._readLocalRoom(this.roomCode) || defaultRoomData(this.roomCode);
      cur.polls = cur.polls || {};
      cur.polls[caseId] = { votes: simulatedVotes };
      this._writeLocalRoom(cur);
    }
  }

  async syncMediaOverrides(overrides) {
    if (!this.roomCode) return;
    if (this.transport === 'firebase' && this._fbMod) {
      const { ref, set } = this._fbMod;
      await set(ref(this._db, `rooms/${this.roomCode}/mediaOverrides`), overrides || {});
    } else {
      const cur = this._readLocalRoom(this.roomCode) || defaultRoomData(this.roomCode);
      cur.mediaOverrides = overrides || {};
      this._writeLocalRoom(cur);
    }
  }
}

export const roomSession = new RoomSession();
