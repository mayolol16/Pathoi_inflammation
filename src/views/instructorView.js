import { CASES } from '../data/cases.js';
import { ORIENTATION } from '../data/orientation.js';
import { resolveCaseZones } from '../data/mediaCatalog.js';
import { ELABORATE_GUIDES, generateTalkingPoints, VIGNETTE_EXPLAINERS } from '../data/tutorContent.js';
import { renderCaseSlideViewer, renderOrientationVisual } from '../components/slideViewer.js';
import { openTutorDrawer } from '../components/tutorDrawer.js';
import { openQRModal } from '../components/qrModal.js';
import { openSettingsModal } from '../components/settingsModal.js';
import { createVerifierController } from './verifierView.js';
import { getInstructorPasscode, isDefaultPasscode } from '../config/firebaseConfig.js';
import { generateRoomCode, roomSession } from '../services/realtime.js';
import { isInstructorAuthed, loadMediaOverrides, setInstructorAuthed } from '../services/storage.js';
import { escapeHtml } from '../utils/html.js';

const ROOM_STORAGE_KEY = 'imc530_last_instructor_room';

export function createInstructorController(onRerender, initialTab = 'classroom') {
  let authed = isInstructorAuthed();
  let authError = '';
  let connError = '';
  let activeTab = initialTab; // 'classroom' | 'verify'
  let projectorMode = false;
  let reasoningFilter = 'all';
  let revealedZones = {}; // caseId -> Set
  let mediatorsOpen = {}; // caseId -> bool
  let caseMediaMode = {}; // caseId -> 'photo' | 'model'
  let oriMediaMode = {}; // `${id}:${shown}` -> 'photo' | 'model'
  let activeZoneCallout = {}; // caseId -> { idx, zone }

  const verifier = createVerifierController(onRerender);
  let snap = roomSession.getSnapshot();

  const unsub = roomSession.subscribe((nextSnap) => {
    snap = nextSnap;
    if (authed) onRerender();
  });

  async function ensureRoomConnected() {
    if (roomSession.roomCode && roomSession.role === 'instructor') return;
    let code = '';
    try {
      code = sessionStorage.getItem(ROOM_STORAGE_KEY) || '';
    } catch {
      // ignore
    }
    if (!code) {
      code = generateRoomCode();
      try { sessionStorage.setItem(ROOM_STORAGE_KEY, code); } catch { /* ignore */ }
    }
    try {
      connError = '';
      await roomSession.connect(code, 'instructor', 'Instructor', true);
      const localOv = loadMediaOverrides();
      if (Object.keys(localOv).length) {
        await roomSession.syncMediaOverrides(localOv);
      }
    } catch (err) {
      connError = err.message || 'Could not connect classroom room.';
      onRerender();
    }
  }

  if (authed) {
    ensureRoomConnected();
  }

  function renderAuthGate() {
    return `
      <div class="vignette" style="max-width:480px; margin:36px auto;">
        <p class="stage-kicker">Faculty Access</p>
        <h2 class="stage-title" style="margin-bottom:8px;">Instructor Console</h2>
        <p class="hint" style="margin-top:0;">Enter the instructor passcode to open live classroom polling, pacing controls, and image verification.</p>
        ${isDefaultPasscode() ? `<p style="font-size:13px; color:var(--vital-ink); background:var(--vital-soft); padding:8px 12px; border:1px solid var(--vital);">Default passcode: <code>IMC530</code> (you can change this in Sync &amp; Settings once inside).</p>` : ''}
        <form id="inst-auth-form" style="display:flex; gap:8px; margin-top:14px;">
          <input type="password" id="inst-pass-input" class="text-input" placeholder="Passcode" style="flex:1;" autofocus />
          <button type="submit" class="btn primary">Unlock →</button>
        </form>
        ${authError ? `<p style="color:var(--accent-ink); font-size:13px; margin:10px 0 0;">${escapeHtml(authError)}</p>` : ''}
        <div style="margin-top:16px;">
          <a href="#/" style="font-size:13.5px; color:var(--ink-soft);">← Back to Student View</a>
        </div>
      </div>`;
  }

  function renderTopBar() {
    const code = snap.roomCode || '…';
    const transportLabel = snap.transport === 'firebase' ? 'Firebase Live' : 'Local Multi-Tab Sync';
    const joinUrl = `${window.location.origin}${window.location.pathname}#/join/${encodeURIComponent(code)}`;

    return `
      <div class="session-bar instructor-bar">
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span class="room-pill">ROOM ${escapeHtml(code)}</span>
          <span class="sync-badge ${snap.transport === 'firebase' ? '' : 'warn'}">
            <span class="sync-dot"></span>${escapeHtml(transportLabel)}
          </span>
          <span style="font-family:var(--mono); font-size:12px; color:var(--ink-soft);">
            ${snap.studentCount} student${snap.studentCount === 1 ? '' : 's'} connected
          </span>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <button type="button" class="btn sm primary" id="inst-qr-btn">QR Code</button>
          <a class="btn sm" href="${escapeHtml(joinUrl)}" target="_blank" rel="noopener">Open Student Tab ↗</a>
          <button type="button" class="btn sm instructor-only" id="inst-new-room">New Room</button>
          <button type="button" class="btn sm ${projectorMode ? 'chosen' : ''}" id="inst-projector-btn">${projectorMode ? 'Exit Projector' : 'Projector Mode'}</button>
          <button type="button" class="btn sm instructor-only" id="inst-settings-btn">Sync &amp; Settings</button>
        </div>
      </div>

      <div class="media-header-row instructor-only" style="margin-top:14px;">
        <div class="segmented-toggle">
          <button type="button" class="${activeTab === 'classroom' ? 'active' : ''}" id="inst-tab-classroom">Live Classroom</button>
          <button type="button" class="${activeTab === 'verify' ? 'active' : ''}" id="inst-tab-verify">Verify Images &amp; Pins</button>
        </div>
        ${
          activeTab === 'classroom'
            ? `<div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap; font-size:13.5px;">
                <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
                  <input type="checkbox" id="inst-sync-toggle" ${snap.state.pacingMode === 'instructor' ? 'checked' : ''} />
                  Sync students to my screen
                </label>
                <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;">
                  <input type="checkbox" id="inst-bypass-warmup" ${snap.state.bypassWarmup ? 'checked' : ''} />
                  Allow skipping warm-up
                </label>
              </div>`
            : ''
        }
      </div>`;
  }

  function renderClassroomNav() {
    const rs = snap.state;
    return `
      <div class="case-nav">
        <button type="button" class="${rs.view === 'orient' ? 'active' : ''}" data-inst-nav="orient">
          <span class="n">WARM-UP</span>Normal vs. abnormal
        </button>
        ${CASES.map(
          (c, i) => `
          <button type="button" class="${rs.view === 'case' && rs.caseIdx === i ? 'active' : ''}" data-inst-case="${i}">
            <span class="n">${escapeHtml(c.shortLabel.toUpperCase())}</span>${escapeHtml(c.title)}
          </button>`
        ).join('')}
      </div>`;
  }

  function renderOrientationClassroom() {
    const rs = snap.state;
    const item = ORIENTATION[rs.orientIdx || 0] || ORIENTATION[0];
    const shown = rs.orientPair || 'normal';
    const pane = shown === 'normal' ? item.normal : item.abnormal;
    const mediaKey = `${item.id}:${shown}`;
    const vis = renderOrientationVisual({
      itemId: item.id,
      shown,
      mediaMode: oriMediaMode[mediaKey] || null,
      roomOverrides: snap.mediaOverrides,
      onToggleModeAttr: `data-inst-ori-media="${escapeHtml(mediaKey)}"`,
    });

    return `
      <div class="stage active">
        <p class="stage-kicker">Warm-up · ${rs.orientIdx + 1} of ${ORIENTATION.length}</p>
        <h2 class="stage-title">${escapeHtml(item.resolution)} · ${escapeHtml(item.organ)}</h2>
        <div class="orient-card">
          <h3>${escapeHtml(item.why)}</h3>
          <div class="pair-toggle">
            <button type="button" class="${shown === 'normal' ? 'active' : ''}" data-inst-ori-pair="normal">${escapeHtml(item.toggleLabels ? item.toggleLabels[0] : 'Normal')}</button>
            <button type="button" class="${shown === 'abnormal' ? 'active' : ''}" data-inst-ori-pair="abnormal">${escapeHtml(item.toggleLabels ? item.toggleLabels[1] : 'Abnormal')}</button>
          </div>
          <div class="pair-viewer">
            ${vis.toggleHtml}
            <span class="pair-label ${shown === 'abnormal' ? 'abnormal' : ''}" style="margin-top:8px;">${escapeHtml(pane.label)}</span>
            ${vis.visualMarkup}
            <div class="slide-caption-bar" style="width:100%;">
              <span>${escapeHtml(vis.entry?.caption || '')}</span>
              ${vis.attrLine}
            </div>
          </div>
          <ul class="observe-points">
            ${pane.points.map((p) => `<li><span class="${p.ok ? 'ok' : 'bad'}">${p.ok ? '✓' : '×'}</span><span>${escapeHtml(p.text)}</span></li>`).join('')}
          </ul>
        </div>
        <div class="footnav">
          <button type="button" class="btn" id="inst-ori-prev" ${rs.orientIdx <= 0 ? 'disabled' : ''}>← Previous comparison</button>
          <div style="display:flex; gap:8px;">
            ${
              rs.orientIdx < ORIENTATION.length - 1
                ? `<button type="button" class="btn primary" id="inst-ori-next">Next comparison →</button>`
                : `<button type="button" class="btn primary" data-inst-case="0">Start Case 1 →</button>`
            }
          </div>
        </div>
      </div>`;
  }

  function renderCaseClassroom() {
    const rs = snap.state;
    const c = CASES[rs.caseIdx || 0] || CASES[0];
    const labels = ['Vignette', 'Class vote', 'Slide reveal', 'Discussion'];

    const rail = `
      <div class="rail">
        ${labels.map((_, i) => `<div class="seg ${i < rs.stage ? 'done' : i === rs.stage ? 'now' : ''}"></div>`).join('')}
      </div>
      <div class="rail" style="margin-top:-22px; border:none;">
        ${labels.map((l, i) => `<button type="button" data-inst-stage="${i}" class="lbl" style="flex:1; background:none; border:none; text-align:left; cursor:pointer; font:inherit; color:${i === rs.stage ? 'var(--accent)' : 'inherit'}; font-weight:${i === rs.stage ? 'bold' : 'normal'};">${l}</button>`).join('')}
      </div>`;

    if (rs.stage === 0) {
      return `
        ${rail}
        <div class="stage active">
          <p class="stage-kicker">Engage</p>
          <h2 class="stage-title">Read the vignette together</h2>
          <div class="vignette">
            <p class="patient">${escapeHtml(c.vignette.text)}</p>
            <div class="vitals">
              ${c.vignette.vitals.map((v) => `<span class="vital-chip ${v.warn ? 'warn' : ''}">${escapeHtml(v.label)}</span>`).join('')}
            </div>
            ${
              c.vignette.glossary
                ? `<div style="border-top:1px solid var(--line); padding-top:12px; margin-top:4px;">
                    <p style="font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--ink-faint); margin:0 0 8px;">Key terms</p>
                    ${c.vignette.glossary.map((g) => `<p style="font-size:13.5px; margin:0 0 6px;"><b>${escapeHtml(g.term)}</b> — ${escapeHtml(g.def)}</p>`).join('')}
                  </div>`
                : ''
            }
          </div>
          <div class="btn-row">
            <button type="button" class="btn primary" data-inst-stage="1">Open live poll →</button>
            <button type="button" class="btn instructor-only" id="inst-vignette-guide">Vignette anatomy recap ↗</button>
          </div>
        </div>`;
    }

    if (rs.stage === 1) {
      const summary = roomSession.getVoteSummary(c.id, c.hypotheses);
      const total = summary.total || 1;
      const pollStatus = rs.pollStatus || 'open';
      const showCorrectHighlight = pollStatus === 'revealed';
      const correctCount = summary.counts[c.correctHypothesis] || 0;
      const correctPct = summary.total ? Math.round((correctCount / total) * 100) : 0;

      const spotlighted = rs.spotlightReasoningId
        ? summary.entries.find((e) => e.id === rs.spotlightReasoningId)
        : null;

      const reasonings = summary.entries.filter(
        (e) => e.reasoning && (reasoningFilter === 'all' || e.choice === reasoningFilter)
      );

      return `
        ${rail}
        <div class="stage active">
          <p class="stage-kicker">Explore — live class vote</p>
          <h2 class="stage-title">Poll the room before revealing anything</h2>

          <div class="btn-row instructor-only" style="margin-top:8px;">
            <button type="button" class="btn sm ${pollStatus === 'open' ? 'vital-btn' : ''}" data-poll-status="open">1. Open Poll</button>
            <button type="button" class="btn sm ${pollStatus === 'closed' ? 'chosen' : ''}" data-poll-status="closed">2. Close Poll</button>
            <button type="button" class="btn sm ${pollStatus === 'revealed' ? 'primary' : ''}" data-poll-status="revealed">3. Reveal Correct &amp; Share Bars</button>
            <button type="button" class="btn sm" id="inst-sim-votes">Simulate Votes ↻</button>
            <button type="button" class="btn sm" id="inst-reset-poll">Reset Poll</button>
          </div>

          <div class="poll-card">
            <div class="live-tag">
              <span class="live-dot"></span>
              ${pollStatus === 'open' ? 'Poll Open' : pollStatus === 'closed' ? 'Poll Closed' : 'Results Revealed'} — ${summary.total} response${summary.total === 1 ? '' : 's'}
            </div>
            ${c.hypotheses
              .map((h) => {
                const cnt = summary.counts[h.key] || 0;
                const pct = summary.total ? Math.round((cnt / total) * 100) : 0;
                const fillClass = showCorrectHighlight && h.key === c.correctHypothesis ? 'correct' : '';
                return `
                  <div class="poll-bar-row">
                    <div class="label-row">
                      <span>${escapeHtml(h.label)} ${showCorrectHighlight && h.key === c.correctHypothesis ? '✓' : ''}</span>
                      <span class="pct">${pct}% (${cnt})</span>
                    </div>
                    <div class="poll-track"><div class="poll-fill ${fillClass}" style="width:${pct}%;"></div></div>
                  </div>`;
              })
              .join('')}
            ${
              summary.total > 0
                ? `<div class="poll-meta">${100 - correctPct}% of the class did not select the diagnosis this case turns out to support.</div>`
                : `<p class="empty-note">Waiting for student votes in Room ${escapeHtml(snap.roomCode)}. Students scan QR or join at <code>#/join/${escapeHtml(snap.roomCode)}</code>.</p>`
            }
          </div>

          ${
            spotlighted
              ? `<div class="spotlight-banner">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                    <p class="stage-kicker" style="margin:0;">Spotlighted Student Reasoning</p>
                    <button type="button" class="btn sm instructor-only" id="inst-clear-spotlight">Clear spotlight</button>
                  </div>
                  <p style="margin:6px 0 0; font-size:16px;">"${escapeHtml(spotlighted.reasoning)}"</p>
                </div>`
              : ''
          }

          <div class="btn-row">
            <button type="button" class="btn instructor-only" id="inst-talking-points">Get Instructor Talking Points ↗</button>
            <button type="button" class="btn primary" data-inst-stage="2">Reveal the slide to the class →</button>
          </div>

          <div class="reasoning-feed instructor-only">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
              <h3 style="margin:0; font-size:16px; font-weight:400;">Anonymized Student Reasoning (${reasonings.length})</h3>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button type="button" class="btn sm ${reasoningFilter === 'all' ? 'chosen' : ''}" data-reason-filter="all">All</button>
                ${c.hypotheses
                  .map(
                    (h) =>
                      `<button type="button" class="btn sm ${reasoningFilter === h.key ? 'chosen' : ''}" data-reason-filter="${escapeHtml(h.key)}">${escapeHtml(h.key)}</button>`
                  )
                  .join('')}
              </div>
            </div>
            ${
              reasonings.length === 0
                ? `<p class="empty-note">No written reasoning submitted yet for this filter.</p>`
                : reasonings
                    .map((r) => {
                      const label = c.hypotheses.find((h) => h.key === r.choice)?.label || r.choice;
                      const isSpot = rs.spotlightReasoningId === r.id;
                      return `
                        <div class="reasoning-item">
                          <div>
                            <span style="font-family:var(--mono); font-size:10.5px; color:var(--accent); text-transform:uppercase;">${escapeHtml(label)}</span>
                            <p style="margin:3px 0 0; font-size:14.5px;">"${escapeHtml(r.reasoning)}"</p>
                          </div>
                          <button type="button" class="btn sm ${isSpot ? 'chosen' : ''}" data-spot-reason="${escapeHtml(r.id)}">
                            ${isSpot ? 'Spotlighted ★' : 'Spotlight'}
                          </button>
                        </div>`;
                    })
                    .join('')
            }
          </div>
        </div>`;
    }

    if (rs.stage === 2) {
      const revealed = revealedZones[c.id] || new Set();
      const zones = resolveCaseZones(c, snap.mediaOverrides);
      const medOpen = Boolean(mediatorsOpen[c.id]);
      const callout = activeZoneCallout[c.id];

      return `
        ${rail}
        <div class="stage active">
          <p class="stage-kicker">Explain — Slide Reveal</p>
          <h2 class="stage-title">${escapeHtml(c.image.placeholderLabel)}</h2>
          <p class="hint">Clicking any zone reveals the finding and broadcasts a spotlight ring to connected student screens.</p>
          ${renderCaseSlideViewer({
            caseObj: c,
            revealedZones: revealed,
            mediaMode: caseMediaMode[c.id] || null,
            spotlightZoneId: rs.spotlightZoneId,
            roomOverrides: snap.mediaOverrides,
          })}
          ${
            callout
              ? `<div class="zone-callout"><b>Zone ${callout.idx + 1} — ${escapeHtml(callout.zone.label || callout.zone.id)}.</b> ${escapeHtml(callout.zone.finding)}</div>`
              : ''
          }
          ${
            c.mediators
              ? `<div class="mediators-block">
                  <button type="button" class="mediators-toggle" id="inst-med-toggle">
                    <span>${medOpen ? '▾' : '▸'} What's actually driving this, at the molecule level?</span>
                  </button>
                  ${
                    medOpen
                      ? `<div class="mediators-body">
                          <p class="mediators-intro">${escapeHtml(c.mediators.intro)}</p>
                          <ol class="mediators-chain">
                            ${c.mediators.chain.map((m) => `<li><b>${escapeHtml(m.step)}.</b> ${escapeHtml(m.detail)}</li>`).join('')}
                          </ol>
                        </div>`
                      : ''
                  }
                </div>`
              : ''
          }
          <div class="btn-row">
            <button type="button" class="btn sm instructor-only" id="inst-reveal-all-zones">Reveal All Zones</button>
            <button type="button" class="btn sm instructor-only" id="inst-reset-zones">Reset Zones</button>
            ${rs.spotlightZoneId ? `<button type="button" class="btn sm instructor-only" id="inst-clear-zone-spot">Clear zone spotlight</button>` : ''}
            <button type="button" class="btn primary" data-inst-stage="3">Diagnosis &amp; Discussion →</button>
          </div>
        </div>`;
    }

    // Stage 3 Discussion
    return `
      ${rail}
      <div class="stage active">
        <p class="stage-kicker">Explain → Discussion</p>
        <h2 class="stage-title">${escapeHtml(c.diagnosis.name)}</h2>
        <div class="reveal-panel">
          <h3>Diagnosis</h3>
          <p>${escapeHtml(c.diagnosis.rationale)}</p>
        </div>
        <p class="stage-kicker" style="margin-top:24px;">Discussion prompts for the room</p>
        <div>
          ${c.elaborate
            .map(
              (e, idx) => `
            <div class="prompt-card" data-inst-elab="${idx}">
              <span class="tag">${escapeHtml(e.tag)}</span>
              <span class="q">${escapeHtml(e.q)} ↗</span>
            </div>`
            )
            .join('')}
        </div>
        <div class="footnav">
          <button type="button" class="btn" data-inst-stage="0">↺ Restart this case</button>
          ${
            rs.caseIdx < CASES.length - 1
              ? `<button type="button" class="btn primary" data-inst-case="${rs.caseIdx + 1}">Next case →</button>`
              : `<span class="empty-note">Last case in this session.</span>`
          }
        </div>
      </div>`;
  }

  function render() {
    if (!authed) return renderAuthGate();
    const rs = snap.state;
    return `
      ${connError ? `<div class="banner-notice">${escapeHtml(connError)}</div>` : ''}
      ${renderTopBar()}
      ${
        activeTab === 'verify'
          ? verifier.render()
          : `${renderClassroomNav()}${rs.view === 'orient' ? renderOrientationClassroom() : renderCaseClassroom()}`
      }
    `;
  }

  function bindEvents(container) {
    if (!authed) {
      container.querySelector('#inst-auth-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const entered = container.querySelector('#inst-pass-input')?.value?.trim() || '';
        if (entered === getInstructorPasscode()) {
          authed = true;
          authError = '';
          setInstructorAuthed(true);
          await ensureRoomConnected();
          onRerender();
        } else {
          authError = 'Incorrect passcode.';
          onRerender();
        }
      });
      return;
    }

    // Top bar
    container.querySelector('#inst-qr-btn')?.addEventListener('click', () => {
      if (snap.roomCode) openQRModal(snap.roomCode);
    });
    container.querySelector('#inst-new-room')?.addEventListener('click', async () => {
      const code = generateRoomCode();
      try { sessionStorage.setItem(ROOM_STORAGE_KEY, code); } catch { /* ignore */ }
      await roomSession.connect(code, 'instructor', 'Instructor', true);
      const localOv = loadMediaOverrides();
      if (Object.keys(localOv).length) await roomSession.syncMediaOverrides(localOv);
      onRerender();
    });
    container.querySelector('#inst-projector-btn')?.addEventListener('click', () => {
      projectorMode = !projectorMode;
      document.body.classList.toggle('projector-mode', projectorMode);
      onRerender();
    });
    container.querySelector('#inst-settings-btn')?.addEventListener('click', () => {
      openSettingsModal(async () => {
        const curCode = roomSession.roomCode;
        if (curCode) {
          await roomSession.connect(curCode, 'instructor', 'Instructor', true);
        }
        onRerender();
      });
    });

    container.querySelector('#inst-tab-classroom')?.addEventListener('click', () => {
      activeTab = 'classroom';
      onRerender();
    });
    container.querySelector('#inst-tab-verify')?.addEventListener('click', () => {
      activeTab = 'verify';
      onRerender();
    });

    if (activeTab === 'verify') {
      verifier.bindEvents(container);
      return;
    }

    // Classroom controls
    container.querySelector('#inst-sync-toggle')?.addEventListener('change', (e) => {
      roomSession.updateRoomState({ pacingMode: e.target.checked ? 'instructor' : 'free' });
    });
    container.querySelector('#inst-bypass-warmup')?.addEventListener('change', (e) => {
      roomSession.updateRoomState({ bypassWarmup: e.target.checked });
    });

    container.querySelector('[data-inst-nav="orient"]')?.addEventListener('click', () => {
      roomSession.updateRoomState({ view: 'orient', spotlightZoneId: null, spotlightReasoningId: null });
    });
    container.querySelectorAll('[data-inst-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        roomSession.updateRoomState({
          view: 'case',
          caseIdx: Number(btn.dataset.instCase),
          stage: 0,
          pollStatus: 'open',
          spotlightZoneId: null,
          spotlightReasoningId: null,
        });
      });
    });
    container.querySelectorAll('[data-inst-stage]').forEach((btn) => {
      btn.addEventListener('click', () => {
        roomSession.updateRoomState({
          stage: Number(btn.dataset.instStage),
          spotlightZoneId: null,
        });
      });
    });

    // Orientation controls
    container.querySelectorAll('[data-inst-ori-pair]').forEach((btn) => {
      btn.addEventListener('click', () => {
        roomSession.updateRoomState({ orientPair: btn.dataset.instOriPair });
      });
    });
    container.querySelectorAll('[data-inst-ori-media] button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.closest('[data-inst-ori-media]').dataset.instOriMedia;
        oriMediaMode[key] = btn.dataset.mediaMode;
        onRerender();
      });
    });
    container.querySelector('#inst-ori-prev')?.addEventListener('click', () => {
      roomSession.updateRoomState({ orientIdx: Math.max(0, (snap.state.orientIdx || 0) - 1), orientPair: 'normal' });
    });
    container.querySelector('#inst-ori-next')?.addEventListener('click', () => {
      roomSession.updateRoomState({
        orientIdx: Math.min(ORIENTATION.length - 1, (snap.state.orientIdx || 0) + 1),
        orientPair: 'normal',
      });
    });

    const c = CASES[snap.state.caseIdx || 0] || CASES[0];

    // Stage 0
    container.querySelector('#inst-vignette-guide')?.addEventListener('click', () => {
      openTutorDrawer({
        type: 'vignette',
        kicker: `${c.shortLabel} — Vignette Walkthrough`,
        title: VIGNETTE_EXPLAINERS[c.id].title,
        data: VIGNETTE_EXPLAINERS[c.id],
        caseContext: `${c.shortLabel}: ${c.vignette.text}`,
      });
    });

    // Stage 1 Poll
    container.querySelectorAll('[data-poll-status]').forEach((btn) => {
      btn.addEventListener('click', () => {
        roomSession.updateRoomState({ pollStatus: btn.dataset.pollStatus });
      });
    });
    container.querySelector('#inst-sim-votes')?.addEventListener('click', () => {
      const sampleNotes = {
        appy: 'Epigastric pain migrating to RLQ + rebound tenderness + bands points straight to appendicitis.',
        gastro: 'Nausea and anorexia made me consider viral gastroenteritis first.',
        ectopic: 'Female of reproductive age with RLQ pain — want to rule out ectopic pregnancy.',
        'pud-bleed': 'Years of epigastric pain followed by sudden bright red hematemesis = ulcer eroding into an artery.',
        varices: 'Massive bright red hematemesis + shock made me think of esophageal varices.',
        tb: '6 weeks of night sweats, weight loss, cavitary upper-lobe lesion points to TB.',
        sarcoid: 'Mediastinal lymphadenopathy made me think of sarcoidosis.',
      };
      roomSession.simulateVotes(c.id, c.classPollDemo, sampleNotes);
    });
    container.querySelector('#inst-reset-poll')?.addEventListener('click', () => {
      roomSession.resetPoll(c.id);
      roomSession.updateRoomState({ pollStatus: 'open', spotlightReasoningId: null });
    });
    container.querySelector('#inst-talking-points')?.addEventListener('click', () => {
      const summary = roomSession.getVoteSummary(c.id, c.hypotheses);
      const tp = generateTalkingPoints(c, summary.counts);
      openTutorDrawer({
        type: 'talking-points',
        kicker: 'Instructor Poll Debrief',
        title: `${c.shortLabel} — Live Talking Points`,
        data: tp,
        caseContext: `${c.shortLabel}: ${c.vignette.text}`,
      });
    });
    container.querySelectorAll('[data-reason-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        reasoningFilter = btn.dataset.reasonFilter;
        onRerender();
      });
    });
    container.querySelectorAll('[data-spot-reason]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.spotReason;
        const next = snap.state.spotlightReasoningId === id ? null : id;
        roomSession.updateRoomState({ spotlightReasoningId: next });
      });
    });
    container.querySelector('#inst-clear-spotlight')?.addEventListener('click', () => {
      roomSession.updateRoomState({ spotlightReasoningId: null });
    });

    // Stage 2 Slide Reveal
    container.querySelectorAll(`[data-case-media-toggle="${c.id}"] button`).forEach((btn) => {
      btn.addEventListener('click', () => {
        caseMediaMode[c.id] = btn.dataset.mediaMode;
        onRerender();
      });
    });
    container.querySelectorAll(`#slide-wrap-${c.id} .zone-pin`).forEach((pin) => {
      pin.addEventListener('click', () => {
        const zoneId = pin.dataset.zoneId;
        const idx = Number(pin.dataset.zoneIdx);
        const zones = resolveCaseZones(c, snap.mediaOverrides);
        const zone = zones.find((z) => z.id === zoneId);
        if (!revealedZones[c.id]) revealedZones[c.id] = new Set();
        revealedZones[c.id].add(zoneId);
        activeZoneCallout[c.id] = { idx, zone };
        roomSession.updateRoomState({ spotlightZoneId: zoneId });
        onRerender();
      });
    });
    container.querySelector('#inst-clear-zone-spot')?.addEventListener('click', () => {
      roomSession.updateRoomState({ spotlightZoneId: null });
    });
    container.querySelector('#inst-reveal-all-zones')?.addEventListener('click', () => {
      const zones = resolveCaseZones(c, snap.mediaOverrides);
      revealedZones[c.id] = new Set(zones.map((z) => z.id));
      onRerender();
    });
    container.querySelector('#inst-reset-zones')?.addEventListener('click', () => {
      revealedZones[c.id] = new Set();
      delete activeZoneCallout[c.id];
      roomSession.updateRoomState({ spotlightZoneId: null });
      onRerender();
    });
    container.querySelector('#inst-med-toggle')?.addEventListener('click', () => {
      mediatorsOpen[c.id] = !mediatorsOpen[c.id];
      onRerender();
    });

    // Stage 3 Elaborate
    container.querySelectorAll('[data-inst-elab]').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = Number(card.dataset.instElab);
        const guide = ELABORATE_GUIDES[c.id]?.[idx];
        if (!guide) return;
        openTutorDrawer({
          type: 'elaborate',
          kicker: `${c.shortLabel} — Instructor Facilitation`,
          title: c.diagnosis.name,
          data: guide,
          isInstructor: true,
          caseContext: `${c.shortLabel} (${c.diagnosis.name}): ${c.diagnosis.rationale}`,
        });
      });
    });
  }

  return {
    render,
    bindEvents,
    setTab: (t) => { activeTab = t; },
    destroy: () => {
      document.body.classList.remove('projector-mode');
      unsub();
      if (roomSession.role === 'instructor') roomSession.disconnect();
    },
  };
}
