import { getDeviceInfo } from '../utils/deviceInfo.js';
import { getOrCreateLearnerId } from './storage.js';
import { roomSession } from './realtime.js';

const ANALYTICS_LOCAL_CACHE = 'imc530_student_analytics_cache_v1';

function emptyCases() {
  return {
    case1: {
      pick: '',
      isCorrect: null,
      reasoning: '',
      zonesExamined: [],
      mediatorsOpened: false,
      vignetteExplainerOpened: false,
      whatsThisClicked: [],
      elaborateOpened: [],
      elaborateRevealed: 0,
      aiQuestionsAsked: 0,
    },
    case2: {
      pick: '',
      isCorrect: null,
      reasoning: '',
      zonesExamined: [],
      mediatorsOpened: false,
      vignetteExplainerOpened: false,
      whatsThisClicked: [],
      elaborateOpened: [],
      elaborateRevealed: 0,
      aiQuestionsAsked: 0,
    },
    case3: {
      pick: '',
      isCorrect: null,
      reasoning: '',
      zonesExamined: [],
      mediatorsOpened: false,
      vignetteExplainerOpened: false,
      whatsThisClicked: [],
      elaborateOpened: [],
      elaborateRevealed: 0,
      aiQuestionsAsked: 0,
    },
  };
}

function createInitialRecord(learnerId) {
  const now = Date.now();
  return {
    learnerId,
    name: '',
    mode: 'self-paced',
    roomCode: 'SELF_PACED',
    device: getDeviceInfo(),
    firstSeenAt: now,
    lastActiveAt: now,
    activeSeconds: 0,
    orientCompleted: [],
    orientFlips: 0,
    modelToggles: 0,
    cases: emptyCases(),
    events: [],
  };
}

class StudentAnalyticsTracker {
  constructor() {
    this.record = null;
    this.flushTimer = null;
    this.tickTimer = null;
    this.lastTickTs = 0;
    this.initialized = false;
  }

  init(initialContext = {}) {
    if (this.initialized && this.record) {
      this.setContext(initialContext);
      return this.record;
    }

    const learnerId = getOrCreateLearnerId();
    let loaded = null;
    try {
      const raw = localStorage.getItem(ANALYTICS_LOCAL_CACHE);
      if (raw) loaded = JSON.parse(raw);
    } catch {
      loaded = null;
    }

    const base = createInitialRecord(learnerId);
    this.record = loaded && loaded.learnerId === learnerId
      ? {
          ...base,
          ...loaded,
          device: getDeviceInfo(),
          cases: {
            case1: { ...base.cases.case1, ...(loaded.cases?.case1 || {}) },
            case2: { ...base.cases.case2, ...(loaded.cases?.case2 || {}) },
            case3: { ...base.cases.case3, ...(loaded.cases?.case3 || {}) },
          },
          events: Array.isArray(loaded.events) ? loaded.events : [],
        }
      : base;

    this.initialized = true;
    this.setContext(initialContext);

    if (typeof document !== 'undefined') {
      this.lastTickTs = Date.now();
      this.tickTimer = setInterval(() => {
        if (!this.record) return;
        const now = Date.now();
        if (document.visibilityState === 'visible') {
          const deltaSec = Math.min(30, Math.round((now - this.lastTickTs) / 1000));
          if (deltaSec > 0) {
            this.record.activeSeconds = (this.record.activeSeconds || 0) + deltaSec;
            this.record.lastActiveAt = now;
            this._saveLocal();
          }
        }
        this.lastTickTs = now;
      }, 15000);

      this.syncTimer = setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.flush();
        }
      }, 30000);
    }

    this._scheduleFlush();
    return this.record;
  }

  destroy() {
    if (this.tickTimer) { clearInterval(this.tickTimer); this.tickTimer = null; }
    if (this.syncTimer) { clearInterval(this.syncTimer); this.syncTimer = null; }
    if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
    this.flush();
  }

  _ensure() {
    if (!this.record) this.init();
    return this.record;
  }

  _saveLocal() {
    if (!this.record) return;
    try {
      localStorage.setItem(ANALYTICS_LOCAL_CACHE, JSON.stringify(this.record));
    } catch {
      // ignore
    }
  }

  _pushEvent(action, detail = '') {
    const rec = this._ensure();
    rec.lastActiveAt = Date.now();
    rec.events = rec.events || [];
    rec.events.push({ ts: rec.lastActiveAt, action, detail });
    if (rec.events.length > 25) {
      rec.events = rec.events.slice(-25);
    }
    this._saveLocal();
    this._scheduleFlush();
  }

  _scheduleFlush() {
    this._saveLocal();
    if (typeof window === 'undefined') return;
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flush();
    }, 800);
  }

  async flush() {
    if (!this.record) return;
    const targetRoom = this.record.mode === 'live' && this.record.roomCode
      ? this.record.roomCode
      : 'SELF_PACED';
    try {
      await roomSession.writeAnalyticsRecord(targetRoom, this.record.learnerId, this.record);
    } catch {
      // keep local cache silently if offline
    }
  }

  setContext({ mode, roomCode, name } = {}) {
    const rec = this._ensure();
    let changed = false;
    if (mode !== undefined && rec.mode !== mode) {
      rec.mode = mode;
      changed = true;
    }
    if (roomCode !== undefined) {
      const nextRoom = roomCode || 'SELF_PACED';
      if (rec.roomCode !== nextRoom) {
        rec.roomCode = nextRoom;
        changed = true;
      }
    }
    if (name !== undefined && rec.name !== String(name).trim()) {
      rec.name = String(name).trim();
      changed = true;
    }
    if (changed) {
      rec.lastActiveAt = Date.now();
      this._scheduleFlush();
    }
  }

  trackOrientFlip(itemId, shown) {
    const rec = this._ensure();
    rec.orientFlips = (rec.orientFlips || 0) + 1;
    this._pushEvent('orient_flip', `${itemId} → ${shown}`);
  }

  trackOrientComplete(itemId) {
    const rec = this._ensure();
    if (!rec.orientCompleted.includes(itemId)) {
      rec.orientCompleted.push(itemId);
    }
    this._pushEvent('orient_complete', itemId);
  }

  trackMediaToggle(target, mode) {
    const rec = this._ensure();
    rec.modelToggles = (rec.modelToggles || 0) + 1;
    this._pushEvent('media_toggle', `${target} → ${mode}`);
  }

  trackVignetteExplainer(caseId) {
    const rec = this._ensure();
    if (rec.cases[caseId]) rec.cases[caseId].vignetteExplainerOpened = true;
    this._pushEvent('vignette_explainer', caseId);
  }

  trackWhatsThis(caseId, hypKey) {
    const rec = this._ensure();
    const c = rec.cases[caseId];
    if (c && !c.whatsThisClicked.includes(hypKey)) {
      c.whatsThisClicked.push(hypKey);
    }
    this._pushEvent('whats_this', `${caseId}:${hypKey}`);
  }

  trackHypothesisCommit(caseId, pick, isCorrect, reasoning = '') {
    const rec = this._ensure();
    const c = rec.cases[caseId];
    if (c) {
      c.pick = pick;
      c.isCorrect = Boolean(isCorrect);
      c.reasoning = String(reasoning || '').trim();
    }
    this._pushEvent('hypothesis_commit', `${caseId}:${pick} (${isCorrect ? 'correct' : 'incorrect'})`);
  }

  trackZoneExamined(caseId, zoneId) {
    const rec = this._ensure();
    const c = rec.cases[caseId];
    if (c && !c.zonesExamined.includes(zoneId)) {
      c.zonesExamined.push(zoneId);
    }
    this._pushEvent('zone_examined', `${caseId}:${zoneId}`);
  }

  trackMediatorsOpened(caseId) {
    const rec = this._ensure();
    if (rec.cases[caseId]) rec.cases[caseId].mediatorsOpened = true;
    this._pushEvent('mediators_opened', caseId);
  }

  trackElaborateOpened(caseId, idx, tag = '') {
    const rec = this._ensure();
    const c = rec.cases[caseId];
    if (c && !c.elaborateOpened.includes(idx)) {
      c.elaborateOpened.push(idx);
    }
    this._pushEvent('elaborate_opened', `${caseId}#${idx + 1}${tag ? ` (${tag})` : ''}`);
  }

  trackElaborateRevealed(caseId, idx) {
    const rec = this._ensure();
    const c = rec.cases[caseId];
    if (c) c.elaborateRevealed = (c.elaborateRevealed || 0) + 1;
    this._pushEvent('elaborate_revealed', `${caseId}#${idx + 1}`);
  }

  trackAIQuestion(caseId) {
    const rec = this._ensure();
    const c = rec.cases[caseId];
    if (c) c.aiQuestionsAsked = (c.aiQuestionsAsked || 0) + 1;
    this._pushEvent('ai_question', caseId || 'general');
  }
}

export const studentAnalytics = new StudentAnalyticsTracker();

export const initStudentAnalytics = (ctx) => studentAnalytics.init(ctx);
export const setAnalyticsContext = (ctx) => studentAnalytics.setContext(ctx);
export const trackOrientFlip = (id, shown) => studentAnalytics.trackOrientFlip(id, shown);
export const trackOrientComplete = (id) => studentAnalytics.trackOrientComplete(id);
export const trackMediaToggle = (target, mode) => studentAnalytics.trackMediaToggle(target, mode);
export const trackVignetteExplainer = (caseId) => studentAnalytics.trackVignetteExplainer(caseId);
export const trackWhatsThis = (caseId, hypKey) => studentAnalytics.trackWhatsThis(caseId, hypKey);
export const trackHypothesisCommit = (caseId, pick, isCorrect, reasoning) =>
  studentAnalytics.trackHypothesisCommit(caseId, pick, isCorrect, reasoning);
export const trackZoneExamined = (caseId, zoneId) => studentAnalytics.trackZoneExamined(caseId, zoneId);
export const trackMediatorsOpened = (caseId) => studentAnalytics.trackMediatorsOpened(caseId);
export const trackElaborateOpened = (caseId, idx, tag) => studentAnalytics.trackElaborateOpened(caseId, idx, tag);
export const trackElaborateRevealed = (caseId, idx) => studentAnalytics.trackElaborateRevealed(caseId, idx);
export const trackAIQuestion = (caseId) => studentAnalytics.trackAIQuestion(caseId);

/**
 * Exports an array/map of analytics records into RFC-4180 CSV text.
 */
export function buildAnalyticsCSV(recordsMap = {}) {
  const esc = (val) => {
    const s = String(val ?? '');
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const headers = [
    'name',
    'learnerId',
    'mode',
    'roomCode',
    'deviceType',
    'os',
    'browser',
    'screen',
    'activeSeconds',
    'firstSeenISO',
    'lastActiveISO',
    'orientCompletedCount',
    'orientFlips',
    'modelToggles',
    'case1_pick',
    'case1_correct',
    'case1_reasoning',
    'case1_zones',
    'case1_mediators',
    'case1_whatsThis',
    'case1_elaborateOpened',
    'case1_elaborateRevealed',
    'case2_pick',
    'case2_correct',
    'case2_reasoning',
    'case2_zones',
    'case2_mediators',
    'case2_whatsThis',
    'case2_elaborateOpened',
    'case2_elaborateRevealed',
    'case3_pick',
    'case3_correct',
    'case3_reasoning',
    'case3_zones',
    'case3_mediators',
    'case3_whatsThis',
    'case3_elaborateOpened',
    'case3_elaborateRevealed',
  ];

  const rows = [headers.join(',')];
  Object.values(recordsMap || {}).forEach((r) => {
    if (!r) return;
    const dev = r.device || {};
    const c1 = r.cases?.case1 || {};
    const c2 = r.cases?.case2 || {};
    const c3 = r.cases?.case3 || {};
    const line = [
      r.name || 'Anonymous',
      r.learnerId || '',
      r.mode || '',
      r.roomCode || '',
      dev.deviceType || '',
      dev.os || '',
      dev.browser || '',
      dev.screen || '',
      r.activeSeconds || 0,
      r.firstSeenAt ? new Date(r.firstSeenAt).toISOString() : '',
      r.lastActiveAt ? new Date(r.lastActiveAt).toISOString() : '',
      (r.orientCompleted || []).length,
      r.orientFlips || 0,
      r.modelToggles || 0,
      c1.pick || '',
      c1.isCorrect === null || c1.isCorrect === undefined ? '' : c1.isCorrect,
      c1.reasoning || '',
      (c1.zonesExamined || []).length,
      Boolean(c1.mediatorsOpened),
      (c1.whatsThisClicked || []).length,
      (c1.elaborateOpened || []).length,
      c1.elaborateRevealed || 0,
      c2.pick || '',
      c2.isCorrect === null || c2.isCorrect === undefined ? '' : c2.isCorrect,
      c2.reasoning || '',
      (c2.zonesExamined || []).length,
      Boolean(c2.mediatorsOpened),
      (c2.whatsThisClicked || []).length,
      (c2.elaborateOpened || []).length,
      c2.elaborateRevealed || 0,
      c3.pick || '',
      c3.isCorrect === null || c3.isCorrect === undefined ? '' : c3.isCorrect,
      c3.reasoning || '',
      (c3.zonesExamined || []).length,
      Boolean(c3.mediatorsOpened),
      (c3.whatsThisClicked || []).length,
      (c3.elaborateOpened || []).length,
      c3.elaborateRevealed || 0,
    ].map(esc);
    rows.push(line.join(','));
  });

  return rows.join('\n');
}
