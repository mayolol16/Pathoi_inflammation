import { CASES } from '../data/cases.js';
import { buildAnalyticsCSV } from '../services/analytics.js';
import { roomSession } from '../services/realtime.js';
import { escapeHtml } from '../utils/html.js';

function formatDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

function formatTimeAgo(ts) {
  if (!ts) return '—';
  const diff = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function createAnalyticsController(onRerender) {
  let scope = 'room'; // 'room' | 'SELF_PACED'
  let loading = false;
  let error = '';
  let fetchedRecords = null; // null = use snap.analytics when scope === 'room'
  let expandedId = null;

  async function refreshData() {
    const targetRoom = scope === 'room' ? roomSession.roomCode : 'SELF_PACED';
    if (!targetRoom) return;
    loading = true;
    error = '';
    onRerender();
    try {
      fetchedRecords = await roomSession.fetchRoomAnalytics(targetRoom);
      loading = false;
    } catch (err) {
      loading = false;
      error = err.message || 'Could not load student analytics.';
    }
    onRerender();
  }

  function getRecordsMap() {
    if (scope === 'SELF_PACED') {
      return fetchedRecords || {};
    }
    if (fetchedRecords !== null) return fetchedRecords;
    return roomSession.getSnapshot().analytics || {};
  }

  function render() {
    const snap = roomSession.getSnapshot();
    const targetRoom = scope === 'room' ? (snap.roomCode || 'NONE') : 'SELF_PACED';
    const recordsMap = getRecordsMap();
    const list = Object.values(recordsMap)
      .filter(Boolean)
      .sort((a, b) => (b.lastActiveAt || 0) - (a.lastActiveAt || 0));

    const now = Date.now();
    const activeRecent = list.filter((r) => now - (r.lastActiveAt || 0) < 5 * 60 * 1000).length;

    const deviceCounts = { Mobile: 0, Tablet: 0, Desktop: 0 };
    const browserCounts = {};
    let orientCompleteCount = 0;
    let totalZones = 0;
    let totalAnswered = 0;
    let totalCorrect = 0;

    list.forEach((r) => {
      const dt = r.device?.deviceType || 'Desktop';
      deviceCounts[dt] = (deviceCounts[dt] || 0) + 1;
      const br = (r.device?.browser || 'Other').split(' ')[0];
      browserCounts[br] = (browserCounts[br] || 0) + 1;
      if ((r.orientCompleted || []).length >= 5) orientCompleteCount++;
      CASES.forEach((c) => {
        const cr = r.cases?.[c.id];
        if (cr) {
          totalZones += (cr.zonesExamined || []).length;
          if (cr.pick) {
            totalAnswered++;
            if (cr.isCorrect) totalCorrect++;
          }
        }
      });
    });

    const topBrowser = Object.entries(browserCounts).sort((a, b) => b[1] - a[1])[0];
    const avgZones = list.length ? (totalZones / list.length).toFixed(1) : '0.0';
    const accPct = totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return `
      <div class="stage active">
        <p class="stage-kicker">Class Telemetry &amp; Engagement</p>
        <h2 class="stage-title">Student Analytics (${escapeHtml(targetRoom)})</h2>
        <p class="hint">Tracks student name, device, browser, warm-up completion, votes, reasoning, slide zones inspected, and elaboration study actions.</p>

        <div class="session-bar">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <div class="segmented-toggle">
              <button type="button" class="${scope === 'room' ? 'active' : ''}" data-ana-scope="room">Live Room (${escapeHtml(snap.roomCode || '—')})</button>
              <button type="button" class="${scope === 'SELF_PACED' ? 'active' : ''}" data-ana-scope="SELF_PACED">Self-Paced Learners</button>
            </div>
            <button type="button" class="btn sm" id="ana-refresh" ${loading ? 'disabled' : ''}>${loading ? 'Refreshing…' : 'Refresh ↻'}</button>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn sm vital-btn" id="ana-export-csv" ${list.length ? '' : 'disabled'}>Export CSV</button>
            <button type="button" class="btn sm" id="ana-export-json" ${list.length ? '' : 'disabled'}>Export JSON</button>
            <button type="button" class="btn sm" id="ana-clear" ${list.length ? '' : 'disabled'}>Clear</button>
          </div>
        </div>

        ${error ? `<div class="banner-notice">${escapeHtml(error)}</div>` : ''}

        <div class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Learners Tracked</span>
            <div class="kpi-val">${list.length}</div>
            <div class="kpi-sub">${activeRecent} active in last 5 min</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Devices &amp; Browsers</span>
            <div class="kpi-val" style="font-size:17px;">${deviceCounts.Mobile} Mob · ${deviceCounts.Desktop} Desk${deviceCounts.Tablet ? ` · ${deviceCounts.Tablet} Tab` : ''}</div>
            <div class="kpi-sub">${topBrowser ? `Top: ${escapeHtml(topBrowser[0])} (${topBrowser[1]})` : 'No device data yet'}</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Warm-up Done</span>
            <div class="kpi-val">${orientCompleteCount} / ${list.length}</div>
            <div class="kpi-sub">Completed all 5 comparisons</div>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Slide &amp; Case Stats</span>
            <div class="kpi-val">${avgZones} / 12</div>
            <div class="kpi-sub">Avg zones · ${totalAnswered ? `${accPct}% vote accuracy` : 'No votes yet'}</div>
          </div>
        </div>

        ${
          list.length === 0
            ? `<div class="vignette"><p class="empty-note" style="margin:0;">No student activity recorded yet for <b>${escapeHtml(targetRoom)}</b>. Have students join the room (or interact in Self-Paced mode) and click Refresh.</p></div>`
            : `<div class="analytics-table-wrap">
                <table class="analytics-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Device &amp; Browser</th>
                      <th>Warm-up</th>
                      <th>Cases (1 / 2 / 3)</th>
                      <th>Zones</th>
                      <th>Help &amp; Elab</th>
                      <th>Active</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${list.map((r) => renderRow(r)).join('')}
                  </tbody>
                </table>
              </div>`
        }
      </div>`;
  }

  function renderRow(r) {
    const dev = r.device || {};
    const oriCount = (r.orientCompleted || []).length;
    const zonesSum = CASES.reduce((acc, c) => acc + (r.cases?.[c.id]?.zonesExamined?.length || 0), 0);
    const helpSum = CASES.reduce(
      (acc, c) =>
        acc +
        (r.cases?.[c.id]?.whatsThisClicked?.length || 0) +
        (r.cases?.[c.id]?.elaborateOpened?.length || 0) +
        (r.cases?.[c.id]?.mediatorsOpened ? 1 : 0),
      0
    );

    const caseBadges = CASES.map((c, idx) => {
      const cr = r.cases?.[c.id];
      if (!cr?.pick) return `<span style="color:var(--ink-faint);">C${idx + 1}:—</span>`;
      const mark = cr.isCorrect ? '✓' : '×';
      const color = cr.isCorrect ? 'var(--vital-ink)' : 'var(--accent-ink)';
      return `<span style="color:${color}; font-weight:bold;">C${idx + 1}:${mark}</span>`;
    }).join(' ');

    const isExpanded = expandedId === r.learnerId;

    return `
      <tr>
        <td>
          <b>${escapeHtml(r.name || 'Anonymous')}</b><br>
          <span style="font-family:var(--mono); font-size:10.5px; color:var(--ink-faint);">Seen ${escapeHtml(formatTimeAgo(r.lastActiveAt))}</span>
        </td>
        <td>
          <span>${escapeHtml(dev.deviceType || '?')} · ${escapeHtml(dev.os || '?')}</span><br>
          <span style="font-family:var(--mono); font-size:11px; color:var(--ink-soft);">${escapeHtml(dev.browser || '?')} (${escapeHtml(dev.screen || '?')})</span>
        </td>
        <td style="font-family:var(--mono);">${oriCount}/5 <span style="font-size:11px; color:var(--ink-faint);">(${r.orientFlips || 0} flips)</span></td>
        <td style="font-family:var(--mono); font-size:12px;">${caseBadges}</td>
        <td style="font-family:var(--mono);">${zonesSum}/12</td>
        <td style="font-family:var(--mono);">${helpSum}</td>
        <td style="font-family:var(--mono);">${formatDuration(r.activeSeconds)}</td>
        <td><button type="button" class="btn sm ${isExpanded ? 'chosen' : ''}" data-ana-inspect="${escapeHtml(r.learnerId)}">${isExpanded ? 'Hide' : 'Inspect'}</button></td>
      </tr>
      ${isExpanded ? `<tr><td colspan="8" class="analytics-detail">${renderDetail(r)}</td></tr>` : ''}`;
  }

  function renderDetail(r) {
    const dev = r.device || {};
    const events = (r.events || []).slice().reverse().slice(0, 12);
    return `
      <div style="display:grid; gap:12px;">
        <div style="font-family:var(--mono); font-size:11.5px; color:var(--ink-soft);">
          <b>ID:</b> ${escapeHtml(r.learnerId)} · <b>Mode:</b> ${escapeHtml(r.mode)} · <b>Model toggles:</b> ${r.modelToggles || 0}<br>
          <b>UA:</b> ${escapeHtml(dev.userAgent || '')}
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
          ${CASES.map((c) => {
            const cr = r.cases?.[c.id] || {};
            const pickLabel = c.hypotheses.find((h) => h.key === cr.pick)?.label || cr.pick || 'Not voted';
            return `
              <div style="background:var(--paper-raised); border:1px solid var(--line); padding:10px 12px;">
                <div style="font-family:var(--mono); font-size:10.5px; color:var(--accent);">${escapeHtml(c.shortLabel.toUpperCase())}</div>
                <div style="font-size:13.5px; margin:3px 0;"><b>Pick:</b> ${escapeHtml(pickLabel)} ${cr.pick ? (cr.isCorrect ? '✓' : '×') : ''}</div>
                ${cr.reasoning ? `<div style="font-size:13px; color:var(--ink-soft); font-style:italic; margin-bottom:4px;">"${escapeHtml(cr.reasoning)}"</div>` : ''}
                <div style="font-family:var(--mono); font-size:11px; color:var(--ink-soft);">
                  Zones (${(cr.zonesExamined || []).length}/4): ${escapeHtml((cr.zonesExamined || []).join(', ') || 'none')}<br>
                  Mediators: ${cr.mediatorsOpened ? 'Yes' : 'No'} · What's this: ${(cr.whatsThisClicked || []).length} · Elaborate: ${(cr.elaborateOpened || []).length} (${cr.elaborateRevealed || 0} revealed)
                </div>
              </div>`;
          }).join('')}
        </div>
        ${
          events.length
            ? `<div>
                <div style="font-family:var(--mono); font-size:10.5px; text-transform:uppercase; color:var(--ink-faint); margin-bottom:4px;">Recent Actions</div>
                <div style="font-family:var(--mono); font-size:11px; color:var(--ink-soft); line-height:1.5;">
                  ${events.map((ev) => `${new Date(ev.ts).toLocaleTimeString()} · <b>${escapeHtml(ev.action)}</b> ${escapeHtml(ev.detail || '')}`).join('<br>')}
                </div>
              </div>`
            : ''
        }
      </div>`;
  }

  function bindEvents(container) {
    container.querySelectorAll('[data-ana-scope]').forEach((btn) => {
      btn.addEventListener('click', () => {
        scope = btn.dataset.anaScope;
        fetchedRecords = null;
        expandedId = null;
        if (scope === 'SELF_PACED') {
          refreshData();
        } else {
          onRerender();
        }
      });
    });

    container.querySelector('#ana-refresh')?.addEventListener('click', refreshData);

    container.querySelectorAll('[data-ana-inspect]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.anaInspect;
        expandedId = expandedId === id ? null : id;
        onRerender();
      });
    });

    container.querySelector('#ana-export-csv')?.addEventListener('click', () => {
      const records = getRecordsMap();
      const csv = buildAnalyticsCSV(records);
      const targetRoom = scope === 'room' ? (roomSession.roomCode || 'room') : 'SELF_PACED';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imc530-analytics-${targetRoom}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });

    container.querySelector('#ana-export-json')?.addEventListener('click', () => {
      const records = getRecordsMap();
      const targetRoom = scope === 'room' ? (roomSession.roomCode || 'room') : 'SELF_PACED';
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imc530-analytics-${targetRoom}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    container.querySelector('#ana-clear')?.addEventListener('click', async () => {
      const targetRoom = scope === 'room' ? roomSession.roomCode : 'SELF_PACED';
      if (!targetRoom) return;
      if (!confirm(`Clear all collected student analytics for ${targetRoom}?`)) return;
      await roomSession.clearRoomAnalytics(targetRoom);
      fetchedRecords = {};
      expandedId = null;
      onRerender();
    });
  }

  return { render, bindEvents, refreshData };
}
