import { CASES } from '../data/cases.js';
import { ORIENTATION } from '../data/orientation.js';
import { resolveCaseZones } from '../data/mediaCatalog.js';
import { DIFFERENTIAL_EXPLAINERS, ELABORATE_GUIDES, VIGNETTE_EXPLAINERS } from '../data/tutorContent.js';
import { attachInteractiveViewer, renderCaseSlideViewer, renderOrientationVisual } from '../components/slideViewer.js';
import { openTutorDrawer } from '../components/tutorDrawer.js';
import { roomSession } from '../services/realtime.js';
import {
  initStudentAnalytics,
  setAnalyticsContext,
  studentAnalytics,
  trackAIQuestion,
  trackElaborateOpened,
  trackElaborateRevealed,
  trackHypothesisCommit,
  trackMediaToggle,
  trackMediatorsOpened,
  trackOrientComplete,
  trackOrientFlip,
  trackVignetteExplainer,
  trackWhatsThis,
  trackZoneExamined,
} from '../services/analytics.js';
import { loadStudentProgress, saveStudentProgress } from '../services/storage.js';
import { escapeHtml } from '../utils/html.js';

export function createStudentController(onRerender) {
  const saved = loadStudentProgress();

  const local = {
    mode: 'self', // 'self' | 'live'
    studentName: saved.studentName || '',
    editingName: !saved.studentName,
    joinCodeInput: saved.lastRoomCode || '',
    joinError: '',
    joining: false,
    view: saved.view || 'orient',
    orientIdx: saved.orientIdx || 0,
    orientDone: new Set(saved.orientDone || []),
    orientPairShown: {},
    orientMediaMode: {}, // key: `${id}:${shown}` -> 'photo' | 'model'
    orientFeaturesRevealed: {}, // key: `${id}:${shown}` -> Set
    activeOriCallout: {}, // key: `${id}:${shown}` -> { idx, feat }
    caseIdx: saved.caseIdx || 0,
    stage: saved.stage || 0,
    picks: saved.picks || {},
    reasoning: saved.reasoning || {},
    zonesRevealed: Object.fromEntries(
      Object.entries(saved.zonesRevealed || {}).map(([k, arr]) => [k, new Set(arr)])
    ),
    mediatorsOpen: {},
    caseMediaMode: {}, // caseId -> 'photo' | 'model'
    activeZoneCallout: {}, // caseId -> { idx, zone }
  };

  let snap = roomSession.getSnapshot();
  let lastSyncedKey = '';
  let lastInstructorSpotlightId = null;

  initStudentAnalytics({
    mode: 'self-paced',
    roomCode: 'SELF_PACED',
    name: local.studentName,
  });

  function hydrateFromRoomState(rs) {
    if (!rs) return;
    if (rs.pacingMode === 'instructor') {
      local.view = rs.view || 'orient';
      local.orientIdx = rs.orientIdx ?? 0;
      local.caseIdx = rs.caseIdx ?? 0;
      local.stage = rs.stage ?? 0;
      const curOri = ORIENTATION[local.orientIdx];
      if (curOri && rs.orientPair) {
        local.orientPairShown[curOri.id] = rs.orientPair;
      }
    }
    if (rs.revealedZones) {
      Object.entries(rs.revealedZones).forEach(([cid, arr]) => {
        if (!Array.isArray(arr) || !arr.length) return;
        if (!local.zonesRevealed[cid]) local.zonesRevealed[cid] = new Set();
        arr.forEach((zid) => local.zonesRevealed[cid].add(zid));
      });
    }
    if (rs.mediatorsOpen) {
      Object.entries(rs.mediatorsOpen).forEach(([cid, open]) => {
        if (open) local.mediatorsOpen[cid] = true;
      });
    }
    if (rs.caseMediaMode) {
      Object.entries(rs.caseMediaMode).forEach(([cid, mode]) => {
        if (mode && !local.caseMediaMode[cid]) local.caseMediaMode[cid] = mode;
      });
    }
    if (rs.oriMediaMode) {
      Object.entries(rs.oriMediaMode).forEach(([k, mode]) => {
        if (mode && !local.orientMediaMode[k]) local.orientMediaMode[k] = mode;
      });
    }
  }

  const unsub = roomSession.subscribe((nextSnap) => {
    snap = nextSnap;
    if (local.mode === 'live' && snap.connected) {
      const rs = snap.state;
      hydrateFromRoomState(rs);
      const syncKey = `${rs.view}|${rs.orientIdx}|${rs.orientPair}|${rs.caseIdx}|${rs.stage}|${rs.pollStatus}|${rs.pacingMode}|${rs.bypassWarmup}|${rs.spotlightZoneId}|${rs.spotlightReasoningId}|${JSON.stringify(rs.revealedZones || {})}|${JSON.stringify(rs.mediatorsOpen || {})}|${JSON.stringify(rs.annotations || {})}|${JSON.stringify(rs.livePointer || null)}`;
      const activeId = document.activeElement?.id || '';
      const typing =
        activeId.startsWith('student-reasoning-') ||
        activeId === 'stu-name-input' ||
        activeId === 'stu-inline-name' ||
        activeId === 'stu-code-input';
      if (typing && syncKey === lastSyncedKey) {
        return; // Don't interrupt student typing when only vote counts tick
      }
      lastSyncedKey = syncKey;
      onRerender();
    }
  });

  function persistLocal() {
    saveStudentProgress({
      studentName: local.studentName,
      lastRoomCode: local.joinCodeInput,
      view: local.view,
      orientIdx: local.orientIdx,
      orientDone: Array.from(local.orientDone),
      caseIdx: local.caseIdx,
      stage: local.stage,
      picks: local.picks,
      reasoning: local.reasoning,
      zonesRevealed: Object.fromEntries(
        Object.entries(local.zonesRevealed).map(([k, s]) => [k, Array.from(s)])
      ),
    });
  }

  async function joinLiveRoom(code, name) {
    local.joining = true;
    local.joinError = '';
    local.mode = 'live';
    onRerender();
    try {
      const clean = String(code || '').trim().toUpperCase();
      local.joinCodeInput = clean;
      if (name !== undefined) {
        local.studentName = String(name || '').trim();
        if (local.studentName) local.editingName = false;
      }
      persistLocal();
      const connectedSnap = await roomSession.connect(clean, 'student', local.studentName || 'Student', false);
      local.joining = false;
      snap = connectedSnap;
      hydrateFromRoomState(snap.state);
      setAnalyticsContext({
        mode: 'live',
        roomCode: snap.roomCode,
        name: local.studentName,
      });
      lastSyncedKey = '';
      onRerender();
    } catch (err) {
      local.joining = false;
      local.joinError = err.message || 'Could not join room.';
      onRerender();
    }
  }

  function leaveLiveRoom() {
    roomSession.disconnect();
    local.mode = 'self';
    snap = roomSession.getSnapshot();
    setAnalyticsContext({
      mode: 'self-paced',
      roomCode: 'SELF_PACED',
      name: local.studentName,
    });
    onRerender();
  }

  function effectivePosition() {
    const isSynced = local.mode === 'live' && snap.connected && snap.state.pacingMode === 'instructor';
    if (isSynced) {
      return {
        isSynced: true,
        view: snap.state.view || 'orient',
        orientIdx: snap.state.orientIdx ?? 0,
        caseIdx: snap.state.caseIdx ?? 0,
        stage: snap.state.stage ?? 0,
        bypassWarmup: Boolean(snap.state.bypassWarmup),
      };
    }
    return {
      isSynced: false,
      view: local.view,
      orientIdx: local.orientIdx,
      caseIdx: local.caseIdx,
      stage: local.stage,
      bypassWarmup: local.mode === 'live' && snap.connected && Boolean(snap.state.bypassWarmup),
    };
  }

  function renderNameWidget() {
    if (local.editingName || !local.studentName) {
      return `
        <form id="stu-inline-name-form" style="display:inline-flex; gap:6px; align-items:center;">
          <input type="text" id="stu-inline-name" class="text-input serif" placeholder="Your name (attendance)" value="${escapeHtml(local.studentName)}" style="width:165px; padding:5px 8px; font-size:13px;" />
          <button type="submit" class="btn sm">Save</button>
        </form>`;
    }
    return `
      <span style="font-size:13px; color:var(--ink-soft);">
        Student: <b>${escapeHtml(local.studentName)}</b>
        <button type="button" class="icon-btn" id="stu-edit-name-btn" style="padding:2px 6px; margin-left:4px;">Edit</button>
      </span>`;
  }

  function renderConnectionBar(pos) {
    if (local.mode === 'live' && snap.connected) {
      const transportLabel = snap.transport === 'firebase' ? 'Cloud Live Sync' : 'Local Multi-Tab Sync';
      return `
        <div class="session-bar live">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="sync-badge"><span class="sync-dot"></span>${escapeHtml(transportLabel)}</span>
            <span class="room-pill">Room ${escapeHtml(snap.roomCode)}</span>
            <span style="font-size:13.5px; color:var(--ink-soft);">
              ${pos.isSynced ? 'Following instructor screen' : 'Free navigation enabled'}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            ${renderNameWidget()}
            <button type="button" class="btn sm" id="stu-leave-room">Switch to Self-Paced</button>
          </div>
        </div>`;
    }

    return `
      <div class="session-bar">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <div class="segmented-toggle">
            <button type="button" class="${local.mode === 'self' ? 'active' : ''}" id="stu-mode-self">Self-Paced Study</button>
            <button type="button" class="${local.mode === 'live' ? 'active' : ''}" id="stu-mode-live">Join Live Class</button>
          </div>
          <span style="font-size:13.5px; color:var(--ink-soft);">
            ${local.mode === 'self' ? 'Work at your own pace with guided explanations.' : 'Enter the 6-character room code shown by your instructor.'}
          </span>
        </div>
        ${
          local.mode === 'live'
            ? `<form class="join-inline" id="stu-join-form">
                <input type="text" id="stu-name-input" class="text-input serif" placeholder="Your name" value="${escapeHtml(local.studentName)}" style="width:145px;" />
                <input type="text" id="stu-code-input" class="text-input code-input" maxlength="8" placeholder="ROOM" value="${escapeHtml(local.joinCodeInput)}" required />
                <button type="submit" class="btn sm primary" ${local.joining ? 'disabled' : ''}>${local.joining ? 'Joining…' : 'Join'}</button>
              </form>`
            : renderNameWidget()
        }
        ${local.joinError ? `<p style="color:var(--accent-ink); font-size:13px; width:100%; margin:4px 0 0;">${escapeHtml(local.joinError)}</p>` : ''}
      </div>`;
  }

  function renderCaseNav(pos) {
    const orientDone = local.orientDone.size >= ORIENTATION.length || pos.bypassWarmup || pos.isSynced;
    return `
      <div class="case-nav">
        <button type="button" class="${pos.view === 'orient' ? 'active' : ''}" data-stu-nav="orient" ${pos.isSynced ? 'disabled title="Instructor is controlling pacing"' : ''}>
          <span class="n">${local.orientDone.size >= ORIENTATION.length ? 'WARM-UP ✓' : 'START HERE'}</span>Normal vs. abnormal
        </button>
        ${CASES.map((c, i) => {
          const locked = !orientDone;
          const active = pos.view === 'case' && i === pos.caseIdx;
          return `
            <button type="button" class="${active ? 'active' : ''} ${locked ? 'locked' : ''}"
              data-stu-case="${i}" ${pos.isSynced ? 'disabled title="Instructor is controlling pacing"' : ''}>
              <span class="n">${escapeHtml(c.shortLabel.toUpperCase())}${locked ? ' 🔒' : ''}</span>${escapeHtml(c.title)}
            </button>`;
        }).join('')}
      </div>`;
  }

  function renderRail(pos) {
    const labels = pos.isSynced
      ? ['Vignette', 'Live vote', 'Slide reveal', 'Discussion']
      : ['Vignette', 'Your hypothesis', 'Read the slide', 'Elaborate'];
    return `
      <div class="rail">
        ${labels.map((_, i) => `<div class="seg ${i < pos.stage ? 'done' : i === pos.stage ? 'now' : ''}"></div>`).join('')}
      </div>
      <div class="rail" style="margin-top:-22px; border:none;">
        ${labels.map((l, i) => `<div class="lbl" style="flex:1; ${i === pos.stage ? 'color:var(--accent);font-weight:bold;' : ''}">${l}</div>`).join('')}
      </div>`;
  }

  function renderOrientationStage(pos) {
    const item = ORIENTATION[pos.orientIdx] || ORIENTATION[0];
    const shown = local.orientPairShown[item.id] || (pos.isSynced ? snap.state.orientPair : 'normal') || 'normal';
    const pane = shown === 'normal' ? item.normal : item.abnormal;
    const mediaKey = `${item.id}:${shown}`;
    const ov = snap.connected ? snap.mediaOverrides : null;
    const revFeatures = local.orientFeaturesRevealed[mediaKey] || new Set();
    const oriCallout = local.activeOriCallout[mediaKey] || null;
    const annotations = snap.connected ? (snap.state.annotations?.[mediaKey] || []) : [];
    const livePointer = snap.connected ? snap.state.livePointer : null;

    const vis = renderOrientationVisual({
      itemId: item.id,
      shown,
      mediaMode: local.orientMediaMode[mediaKey] || null,
      roomOverrides: ov,
      onToggleModeAttr: `data-ori-media-key="${escapeHtml(mediaKey)}"`,
      features: pane.features || [],
      revealedFeatures: revFeatures,
      annotations,
      livePointer,
    });

    const dots = ORIENTATION.map((o, i) => {
      const cls = local.orientDone.has(o.id) ? 'done' : i === pos.orientIdx ? 'now' : '';
      return `<div class="dot ${cls}"></div>`;
    }).join('');

    const isLast = pos.orientIdx === ORIENTATION.length - 1;
    const thisDone = local.orientDone.has(item.id);

    return `
      <div class="stage active">
        <p class="stage-kicker">Before any patient — build the baseline</p>
        <h2 class="stage-title">Normal vs. abnormal, one structure at a time</h2>
        <p class="hint">No diagnoses here yet. Flip between normal and abnormal, zoom in to inspect details, and click any numbered feature pin.</p>
        <div class="orient-progress">${dots}</div>
        <div class="orient-card">
          <span class="res-tag">${escapeHtml(item.resolution)} resolution · ${escapeHtml(item.organ)}</span>
          <h3>${escapeHtml(item.why)}</h3>
          <div class="pair-toggle">
            <button type="button" class="${shown === 'normal' ? 'active' : ''}" data-ori-pair="normal" data-ori-id="${escapeHtml(item.id)}">${escapeHtml(item.toggleLabels ? item.toggleLabels[0] : 'Normal')}</button>
            <button type="button" class="${shown === 'abnormal' ? 'active' : ''}" data-ori-pair="abnormal" data-ori-id="${escapeHtml(item.id)}">${escapeHtml(item.toggleLabels ? item.toggleLabels[1] : 'Abnormal')}</button>
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
          <div id="stu-ori-callout">
            ${
              oriCallout
                ? `<div class="zone-callout"><b>Feature ${oriCallout.idx + 1} — ${escapeHtml(oriCallout.feat.label)}.</b> ${escapeHtml(oriCallout.feat.finding)}</div>`
                : ''
            }
          </div>
          <ul class="observe-points">
            ${pane.points.map((p) => `<li><span class="${p.ok ? 'ok' : 'bad'}">${p.ok ? '✓' : '×'}</span><span>${escapeHtml(p.text)}</span></li>`).join('')}
          </ul>
        </div>
        <div class="btn-row">
          <button type="button" class="btn" id="ori-flip-btn" data-ori-id="${escapeHtml(item.id)}">Flip back and forth ⇄</button>
          ${
            pos.isSynced
              ? `<span class="empty-note">Instructor controls when the class advances.</span>`
              : `<button type="button" class="btn primary" id="ori-done-btn" data-ori-id="${escapeHtml(item.id)}">
                  ${thisDone ? (isLast ? 'Warm-up complete — go to Case 1 →' : 'Next comparison →') : 'I can tell them apart →'}
                </button>`
          }
        </div>
        ${!pos.isSynced && pos.orientIdx > 0 ? `<div class="footnav" style="border-top:none; padding-top:8px;"><button type="button" class="btn" id="ori-back-btn">← Back</button></div>` : ''}
      </div>`;
  }

  function renderCaseStage(pos) {
    const c = CASES[pos.caseIdx] || CASES[0];
    const ov = snap.connected ? snap.mediaOverrides : null;

    if (pos.stage === 0) {
      return `
        <div class="stage active">
          <p class="stage-kicker">Engage</p>
          <h2 class="stage-title">${pos.isSynced ? 'Read the vignette together' : 'The vignette'}</h2>
          <div class="vignette">
            <p class="patient">${escapeHtml(c.vignette.text)}</p>
            <div class="vitals">
              ${c.vignette.vitals.map((v) => `<span class="vital-chip ${v.warn ? 'warn' : ''}">${escapeHtml(v.label)}</span>`).join('')}
            </div>
            ${
              c.vignette.glossary
                ? `<div style="border-top:1px solid var(--line); padding-top:12px; margin-top:4px;">
                    <p style="font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:0.06em; color:var(--ink-faint); margin:0 0 8px;">New terms in this vignette</p>
                    ${c.vignette.glossary.map((g) => `<p style="font-size:13.5px; margin:0 0 6px;"><b>${escapeHtml(g.term)}</b> — ${escapeHtml(g.def)}</p>`).join('')}
                  </div>`
                : ''
            }
          </div>
          <div class="btn-row">
            ${
              pos.isSynced
                ? `<span class="empty-note">Waiting for instructor to open the vote…</span>`
                : `<button type="button" class="btn primary" data-stu-stage="1">I'm ready to hypothesize →</button>`
            }
            <button type="button" class="btn" id="btn-explain-vignette">I need this explained first ↗</button>
          </div>
        </div>`;
    }

    if (pos.stage === 1) {
      const isLivePoll = local.mode === 'live' && snap.connected;
      const pollStatus = isLivePoll ? snap.state.pollStatus : 'open';
      const summary = isLivePoll ? roomSession.getVoteSummary(c.id, c.hypotheses) : null;
      const picked = local.picks[c.id] || summary?.myVote?.choice || '';
      const reasoningVal = local.reasoning[c.id] ?? summary?.myVote?.reasoning ?? '';
      const locked = isLivePoll && pollStatus !== 'open';

      let liveExtra = '';
      if (isLivePoll && summary?.myVote) {
        liveExtra = `<div class="banner-vital">Vote recorded for <b>${escapeHtml(c.hypotheses.find((h) => h.key === summary.myVote.choice)?.label || summary.myVote.choice)}</b> (${summary.total} class response${summary.total === 1 ? '' : 's'} so far). ${pollStatus === 'open' ? 'You can update your vote until the instructor closes the poll.' : ''}</div>`;
      } else if (isLivePoll && pollStatus === 'closed') {
        liveExtra = `<div class="banner-notice">Poll is closed by the instructor while the room discusses.</div>`;
      }

      let revealedChart = '';
      if (isLivePoll && pollStatus === 'revealed' && summary) {
        const total = summary.total || 1;
        revealedChart = `
          <div class="poll-card">
            <div class="live-tag"><span class="live-dot"></span>Class Poll Results — ${summary.total} responses</div>
            ${c.hypotheses
              .map((h) => {
                const cnt = summary.counts[h.key] || 0;
                const pct = summary.total ? Math.round((cnt / total) * 100) : 0;
                return `
                  <div class="poll-bar-row">
                    <div class="label-row"><span>${escapeHtml(h.label)}</span><span class="pct">${pct}% (${cnt})</span></div>
                    <div class="poll-track"><div class="poll-fill ${h.key === c.correctHypothesis ? 'correct' : ''}" style="width:${pct}%;"></div></div>
                  </div>`;
              })
              .join('')}
          </div>`;
      }

      let spotlightCard = '';
      if (isLivePoll && snap.state.spotlightReasoningId && summary) {
        const sp = summary.entries.find((e) => e.id === snap.state.spotlightReasoningId);
        if (sp && sp.reasoning) {
          spotlightCard = `
            <div class="spotlight-banner">
              <p class="stage-kicker" style="margin:0 0 4px;">Instructor spotlighted student reasoning</p>
              <p style="margin:0; font-size:15px;">"${escapeHtml(sp.reasoning)}"</p>
            </div>`;
        }
      }

      return `
        <div class="stage active">
          <p class="stage-kicker">${isLivePoll ? 'Explore — live classroom vote' : 'Explore'}</p>
          <h2 class="stage-title">What's your leading diagnosis — and why?</h2>
          <p class="hint">No image yet. Commit to a hypothesis before seeing the slide. Tap "what's this?" if you want a quick plain-English refresher on any option.</p>
          ${liveExtra}
          <div class="opt-list">
            ${c.hypotheses
              .map(
                (h) => `
              <div class="opt-row">
                <button type="button" class="btn block ${picked === h.key ? 'chosen' : ''}" style="flex:1; margin-bottom:0;"
                  data-pick-hyp="${escapeHtml(h.key)}" ${locked ? 'disabled' : ''}>${escapeHtml(h.label)}</button>
                <button type="button" class="btn sm" style="flex:0 0 auto;" data-whats-this="${escapeHtml(h.key)}">what's this?</button>
              </div>`
              )
              .join('')}
          </div>
          <textarea class="reasoning" id="student-reasoning-${escapeHtml(c.id)}" ${locked ? 'disabled' : ''}
            placeholder="Your reasoning — what in the vignette points you there, and what argues against the alternatives?">${escapeHtml(reasoningVal)}</textarea>
          <div class="btn-row">
            ${
              isLivePoll
                ? `<button type="button" class="btn primary" id="stu-submit-vote" ${locked ? 'disabled' : ''}>${summary?.myVote ? 'Update Live Vote ✓' : 'Submit Live Vote →'}</button>
                   ${!pos.isSynced ? `<button type="button" class="btn" data-stu-stage="2">Go to slide →</button>` : ''}`
                : `<button type="button" class="btn primary" id="stu-commit-self">Lock it in and see the slide →</button>`
            }
          </div>
          ${revealedChart}
          ${spotlightCard}
        </div>`;
    }

    if (pos.stage === 2) {
      if (!local.zonesRevealed[c.id]) local.zonesRevealed[c.id] = new Set();
      const revealedSet = local.zonesRevealed[c.id];
      const zones = resolveCaseZones(c, ov);
      const allDone = revealedSet.size >= zones.length;
      const medOpen = Boolean(local.mediatorsOpen[c.id]);
      const spotlightId = snap.connected ? snap.state.spotlightZoneId : null;
      const annotations = snap.connected ? (snap.state.annotations?.[c.id] || []) : [];
      const livePointer = snap.connected ? snap.state.livePointer : null;

      if (spotlightId && spotlightId !== lastInstructorSpotlightId) {
        const sIdx = zones.findIndex((z) => z.id === spotlightId);
        if (sIdx >= 0) {
          revealedSet.add(spotlightId);
          local.activeZoneCallout[c.id] = { idx: sIdx, zone: zones[sIdx], fromInstructor: true };
        }
      }
      lastInstructorSpotlightId = spotlightId;
      const activeCallout = local.activeZoneCallout[c.id] || null;

      return `
        <div class="stage active">
          <p class="stage-kicker">Explain</p>
          <h2 class="stage-title">${escapeHtml(c.image.placeholderLabel)}</h2>
          <p class="hint">Zoom in to inspect cellular details, pan by dragging, and click each numbered pin to examine the finding.</p>
          ${renderCaseSlideViewer({
            caseObj: c,
            revealedZones: revealedSet,
            mediaMode: local.caseMediaMode[c.id] || null,
            spotlightZoneId: spotlightId,
            roomOverrides: ov,
            annotations,
            livePointer,
          })}
          <div id="stu-zone-callout">
            ${
              activeCallout
                ? `<div class="zone-callout">
                    ${activeCallout.fromInstructor ? `<span class="verify-pill pending" style="margin-bottom:6px;">Instructor Spotlight</span><br>` : ''}
                    <b>Zone ${activeCallout.idx + 1} — ${escapeHtml(activeCallout.zone.label || activeCallout.zone.id)}.</b> ${escapeHtml(activeCallout.zone.finding)}
                  </div>`
                : ''
            }
          </div>
          ${
            (allDone || pos.isSynced) && c.mediators
              ? `<div class="mediators-block">
                  <button type="button" class="mediators-toggle" id="stu-med-toggle">
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
            ${
              pos.isSynced
                ? `<span class="empty-note">Instructor will advance to Diagnosis &amp; Discussion when ready.</span>`
                : `<button type="button" class="btn primary" data-stu-stage="3" ${allDone ? '' : 'disabled'}>
                    ${allDone ? 'See the diagnosis and rationale →' : 'Examine all zones to continue'}
                  </button>`
            }
          </div>
        </div>`;
    }

    // Stage 3: Diagnosis + Elaborate
    const liveVoteChoice = local.mode === 'live' && snap.connected
      ? roomSession.getVoteSummary(c.id, c.hypotheses).myVote?.choice || ''
      : '';
    const picked = local.picks[c.id] || liveVoteChoice;
    const wasRight = picked === c.correctHypothesis;
    return `
      <div class="stage active">
        <p class="stage-kicker">Explain → Elaborate</p>
        <h2 class="stage-title">${escapeHtml(c.diagnosis.name)}</h2>
        <div class="reveal-panel">
          <h3>
            ${
              picked
                ? `Your call: ${escapeHtml(c.hypotheses.find((h) => h.key === picked)?.label || '—')} ${wasRight ? '— matches the diagnosis' : '— differs from the diagnosis'}`
                : `Diagnosis: ${escapeHtml(c.diagnosis.name)}`
            }
          </h3>
          <p>${escapeHtml(c.diagnosis.rationale)}</p>
        </div>
        <p class="stage-kicker" style="margin-top:24px;">Now push it further</p>
        <div>
          ${c.elaborate
            .map(
              (e, idx) => `
            <div class="prompt-card" data-elab-idx="${idx}">
              <span class="tag">${escapeHtml(e.tag)}</span>
              <span class="q">${escapeHtml(e.q)} ↗</span>
            </div>`
            )
            .join('')}
        </div>
        ${
          pos.isSynced
            ? ''
            : `<div class="footnav">
                <button type="button" class="btn" data-stu-stage="0">↺ Restart this case</button>
                ${pos.caseIdx < CASES.length - 1 ? `<button type="button" class="btn primary" data-stu-next-case="${pos.caseIdx + 1}">Next case →</button>` : '<span class="empty-note">Last case in this session.</span>'}
              </div>`
        }
      </div>`;
  }

  function render() {
    const pos = effectivePosition();
    return `
      ${renderConnectionBar(pos)}
      ${renderCaseNav(pos)}
      ${pos.view === 'orient' ? renderOrientationStage(pos) : `${renderRail(pos)}${renderCaseStage(pos)}`}
    `;
  }

  function bindEvents(container) {
    const pos = effectivePosition();
    const c = CASES[pos.caseIdx] || CASES[0];
    const ov = snap.connected ? snap.mediaOverrides : null;

    // Name edit / save
    container.querySelector('#stu-edit-name-btn')?.addEventListener('click', () => {
      local.editingName = true;
      onRerender();
    });
    container.querySelector('#stu-inline-name-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = container.querySelector('#stu-inline-name')?.value?.trim() || '';
      local.studentName = val;
      local.editingName = !val;
      persistLocal();
      setAnalyticsContext({ name: local.studentName });
      if (local.mode === 'live' && snap.connected) {
        await roomSession.connect(snap.roomCode, 'student', local.studentName || 'Student', false);
      }
      onRerender();
    });

    container.querySelector('#stu-mode-self')?.addEventListener('click', () => {
      local.mode = 'self';
      setAnalyticsContext({ mode: 'self-paced', roomCode: 'SELF_PACED' });
      onRerender();
    });
    container.querySelector('#stu-mode-live')?.addEventListener('click', () => {
      local.mode = 'live';
      onRerender();
    });
    container.querySelector('#stu-leave-room')?.addEventListener('click', leaveLiveRoom);
    container.querySelector('#stu-join-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = container.querySelector('#stu-code-input')?.value;
      const name = container.querySelector('#stu-name-input')?.value;
      joinLiveRoom(code, name);
    });

    // Nav
    container.querySelector('[data-stu-nav="orient"]')?.addEventListener('click', () => {
      if (pos.isSynced) return;
      local.view = 'orient';
      persistLocal();
      onRerender();
    });
    container.querySelectorAll('[data-stu-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (pos.isSynced) return;
        const orientDone = local.orientDone.size >= ORIENTATION.length || pos.bypassWarmup;
        if (!orientDone) {
          alert("Finish the normal-vs-abnormal warm-up first — it's what makes the cases actually readable.");
          return;
        }
        local.view = 'case';
        local.caseIdx = Number(btn.dataset.stuCase);
        local.stage = 0;
        persistLocal();
        onRerender();
      });
    });

    // Orientation controls + interactive viewer
    if (pos.view === 'orient') {
      const item = ORIENTATION[pos.orientIdx] || ORIENTATION[0];
      const shown = local.orientPairShown[item.id] || (pos.isSynced ? snap.state.orientPair : 'normal') || 'normal';
      const pane = shown === 'normal' ? item.normal : item.abnormal;
      const mediaKey = `${item.id}:${shown}`;

      attachInteractiveViewer(container, mediaKey);

      container.querySelectorAll(`#ori-wrap-${item.id} .zone-pin`).forEach((pin) => {
        pin.addEventListener('click', () => {
          const featId = pin.dataset.zoneId;
          const idx = Number(pin.dataset.zoneIdx);
          const feat = (pane.features || []).find((f) => f.id === featId);
          if (!feat) return;
          if (!local.orientFeaturesRevealed[mediaKey]) local.orientFeaturesRevealed[mediaKey] = new Set();
          local.orientFeaturesRevealed[mediaKey].add(featId);
          local.activeOriCallout[mediaKey] = { idx, feat };
          onRerender();
        });
      });
    }

    container.querySelectorAll('[data-ori-pair]').forEach((btn) => {
      btn.addEventListener('click', () => {
        local.orientPairShown[btn.dataset.oriId] = btn.dataset.oriPair;
        trackOrientFlip(btn.dataset.oriId, btn.dataset.oriPair);
        onRerender();
      });
    });
    container.querySelector('#ori-flip-btn')?.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.oriId;
      const cur = local.orientPairShown[id] || 'normal';
      const next = cur === 'normal' ? 'abnormal' : 'normal';
      local.orientPairShown[id] = next;
      trackOrientFlip(id, next);
      onRerender();
    });
    container.querySelectorAll('[data-ori-media-key] button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.closest('[data-ori-media-key]').dataset.oriMediaKey;
        local.orientMediaMode[key] = btn.dataset.mediaMode;
        trackMediaToggle(key, btn.dataset.mediaMode);
        onRerender();
      });
    });
    container.querySelector('#ori-done-btn')?.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.oriId;
      local.orientDone.add(id);
      trackOrientComplete(id);
      if (local.orientIdx < ORIENTATION.length - 1) {
        local.orientIdx += 1;
      } else {
        local.view = 'case';
        local.caseIdx = 0;
        local.stage = 0;
      }
      persistLocal();
      onRerender();
    });
    container.querySelector('#ori-back-btn')?.addEventListener('click', () => {
      local.orientIdx = Math.max(0, local.orientIdx - 1);
      persistLocal();
      onRerender();
    });

    // Case stage navigation
    container.querySelectorAll('[data-stu-stage]').forEach((btn) => {
      btn.addEventListener('click', () => {
        local.stage = Number(btn.dataset.stuStage);
        persistLocal();
        onRerender();
      });
    });
    container.querySelectorAll('[data-stu-next-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        local.caseIdx = Number(btn.dataset.stuNextCase);
        local.stage = 0;
        persistLocal();
        onRerender();
      });
    });

    // Stage 0 Vignette explainer
    container.querySelector('#btn-explain-vignette')?.addEventListener('click', () => {
      trackVignetteExplainer(c.id);
      openTutorDrawer({
        type: 'vignette',
        kicker: `${c.shortLabel} — Vignette walkthrough`,
        title: VIGNETTE_EXPLAINERS[c.id].title,
        data: VIGNETTE_EXPLAINERS[c.id],
        caseContext: `${c.shortLabel}: ${c.vignette.text}`,
        onAskAI: () => trackAIQuestion(c.id),
      });
    });

    // Stage 1 Hypothesis / Live vote
    container.querySelectorAll('[data-pick-hyp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        local.picks[c.id] = btn.dataset.pickHyp;
        persistLocal();
        onRerender();
      });
    });
    container.querySelectorAll('[data-whats-this]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.whatsThis;
        const info = DIFFERENTIAL_EXPLAINERS[key];
        if (!info) return;
        trackWhatsThis(c.id, key);
        openTutorDrawer({
          type: 'differential',
          kicker: 'Differential Diagnosis Refresher',
          title: info.term,
          data: info,
          caseContext: `${c.shortLabel}: ${c.vignette.text}`,
          onAskAI: () => trackAIQuestion(c.id),
        });
      });
    });
    const reasoningBox = container.querySelector(`#student-reasoning-${c.id}`);
    reasoningBox?.addEventListener('input', (e) => {
      local.reasoning[c.id] = e.target.value;
      persistLocal();
    });
    container.querySelector('#stu-commit-self')?.addEventListener('click', () => {
      if (!local.picks[c.id]) {
        alert('Pick one of the options first — committing to a hypothesis is the point.');
        return;
      }
      const pick = local.picks[c.id];
      trackHypothesisCommit(c.id, pick, pick === c.correctHypothesis, local.reasoning[c.id] || '');
      local.stage = 2;
      persistLocal();
      onRerender();
    });
    container.querySelector('#stu-submit-vote')?.addEventListener('click', async () => {
      if (!local.picks[c.id]) {
        alert('Pick one of the options first before submitting your vote.');
        return;
      }
      const pick = local.picks[c.id];
      trackHypothesisCommit(c.id, pick, pick === c.correctHypothesis, local.reasoning[c.id] || '');
      await roomSession.submitVote(c.id, pick, local.reasoning[c.id] || '', local.studentName || 'Student');
      onRerender();
    });

    // Stage 2 Slide Viewer + Zoom + Zones + Mediators
    if (pos.view === 'case' && pos.stage === 2) {
      attachInteractiveViewer(container, c.id);
    }
    container.querySelectorAll(`[data-case-media-toggle="${c.id}"] button`).forEach((btn) => {
      btn.addEventListener('click', () => {
        local.caseMediaMode[c.id] = btn.dataset.mediaMode;
        trackMediaToggle(c.id, btn.dataset.mediaMode);
        onRerender();
      });
    });
    container.querySelectorAll(`#slide-wrap-${c.id} .zone-pin`).forEach((pin) => {
      pin.addEventListener('click', () => {
        const zoneId = pin.dataset.zoneId;
        const idx = Number(pin.dataset.zoneIdx);
        const zones = resolveCaseZones(c, ov);
        const zone = zones.find((z) => z.id === zoneId);
        if (!local.zonesRevealed[c.id]) local.zonesRevealed[c.id] = new Set();
        local.zonesRevealed[c.id].add(zoneId);
        local.activeZoneCallout[c.id] = { idx, zone };
        trackZoneExamined(c.id, zoneId);
        persistLocal();
        onRerender();
      });
    });
    container.querySelector('#stu-med-toggle')?.addEventListener('click', () => {
      local.mediatorsOpen[c.id] = !local.mediatorsOpen[c.id];
      if (local.mediatorsOpen[c.id]) trackMediatorsOpened(c.id);
      onRerender();
    });

    // Stage 3 Elaborate
    container.querySelectorAll('[data-elab-idx]').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = Number(card.dataset.elabIdx);
        const guide = ELABORATE_GUIDES[c.id]?.[idx];
        if (!guide) return;
        trackElaborateOpened(c.id, idx, guide.tag);
        openTutorDrawer({
          type: 'elaborate',
          kicker: `${c.shortLabel} — Guided Elaboration`,
          title: c.diagnosis.name,
          data: guide,
          isInstructor: false,
          caseContext: `${c.shortLabel} (${c.diagnosis.name}): ${c.diagnosis.rationale}`,
          onRevealAnswer: () => trackElaborateRevealed(c.id, idx),
          onAskAI: () => trackAIQuestion(c.id),
        });
      });
    });
  }

  return {
    render,
    bindEvents,
    joinLiveRoom,
    destroy: () => {
      unsub();
      studentAnalytics.destroy();
      if (roomSession.role === 'student') roomSession.disconnect();
    },
  };
}
