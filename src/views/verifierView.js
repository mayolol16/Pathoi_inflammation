import { CASES } from '../data/cases.js';
import { MEDIA_CATALOG, resolveCaseZones, resolveMediaEntry } from '../data/mediaCatalog.js';
import { renderCaseSlideViewer, renderOrientationVisual } from '../components/slideViewer.js';
import { loadMediaOverrides, resetAllMediaOverrides, saveMediaOverride, savePinOverride } from '../services/storage.js';
import { roomSession } from '../services/realtime.js';
import { escapeHtml } from '../utils/html.js';

export function createVerifierController(onRerender) {
  let activeCalibratingZone = {}; // caseId -> zoneId
  let filterKind = 'all'; // 'all' | 'orientation' | 'case'

  function render() {
    const ov = loadMediaOverrides();
    const entries = Object.values(MEDIA_CATALOG).map((m) => resolveMediaEntry(m.id, ov));
    const verifiedCount = entries.filter((e) => e.verified).length;
    const filtered = entries.filter((e) => filterKind === 'all' || e.kind === filterKind);

    return `
      <div class="stage active">
        <p class="stage-kicker">Faculty Quality Control</p>
        <h2 class="stage-title">Verify Pathology Images &amp; Calibrate Zone Pins</h2>
        <p class="hint">
          Inspect each Wikimedia Commons specimen alongside its representative SVG model. Verify images you approve for class, switch to an alternative candidate, paste your own UB slide URL, or click to reposition numbered pins on Case slides.
        </p>

        <div class="session-bar">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="verify-pill ${verifiedCount === entries.length ? 'ok' : 'pending'}">${verifiedCount} / ${entries.length} verified</span>
            <div class="segmented-toggle">
              <button type="button" class="${filterKind === 'all' ? 'active' : ''}" data-ver-filter="all">All (${entries.length})</button>
              <button type="button" class="${filterKind === 'orientation' ? 'active' : ''}" data-ver-filter="orientation">Orientation (10)</button>
              <button type="button" class="${filterKind === 'case' ? 'active' : ''}" data-ver-filter="case">Case Slides (3)</button>
            </div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn sm vital-btn" id="ver-sync-room" ${roomSession.roomCode ? '' : 'disabled title="Connect to a classroom room first"'}>Sync Overrides to Live Room</button>
            <button type="button" class="btn sm" id="ver-export-json">Export mediaConfig.json</button>
            <button type="button" class="btn sm" id="ver-reset-all">Reset Defaults</button>
          </div>
        </div>

        <div style="margin-top:18px;">
          ${filtered.map((entry) => renderEntryCard(entry, ov)).join('')}
        </div>
      </div>`;
  }

  function renderEntryCard(entry, ov) {
    const isCase = entry.kind === 'case';
    const caseObj = isCase ? CASES.find((c) => c.id === entry.id) : null;
    const [oriId, shown] = !isCase ? entry.id.split(':') : [null, null];
    const oriVis = !isCase
      ? renderOrientationVisual({
          itemId: oriId,
          shown,
          mediaMode: 'model',
          roomOverrides: ov,
        })
      : null;

    const calZoneId = isCase ? activeCalibratingZone[caseObj.id] || null : null;
    const zones = isCase ? resolveCaseZones(caseObj, ov) : [];

    return `
      <div class="verifier-card" data-ver-card="${escapeHtml(entry.id)}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap;">
          <div>
            <h3 style="margin:0 0 4px; font-size:17.5px; font-weight:400;">${escapeHtml(entry.title)}</h3>
            <p style="margin:0; font-size:13px; color:var(--ink-soft);">
              ${escapeHtml(entry.caption || '')}
              ${entry.sourcePage ? ` · <a href="${escapeHtml(entry.sourcePage)}" target="_blank" rel="noopener">Wikimedia Commons page ↗</a>` : ''}
            </p>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="verify-pill ${entry.verified ? 'ok' : 'pending'}">${entry.verified ? 'Verified ✓' : 'Pending Verification'}</span>
            <button type="button" class="btn sm ${entry.verified ? '' : 'vital-btn'}" data-ver-toggle="${escapeHtml(entry.id)}">
              ${entry.verified ? 'Unverify' : 'Mark Verified ✓'}
            </button>
          </div>
        </div>

        ${
          isCase
            ? `<div style="margin-top:12px;">
                <p style="font-family:var(--mono); font-size:11px; color:var(--accent); margin:0 0 8px;">
                  PIN CALIBRATOR: Click a zone button below, then click anywhere on the slide image to move that pin.
                </p>
                <div class="btn-row" style="margin:0 0 10px;">
                  ${zones
                    .map(
                      (z, i) => `
                    <button type="button" class="btn sm ${calZoneId === z.id ? 'chosen' : ''}" data-cal-case="${escapeHtml(caseObj.id)}" data-cal-zone="${escapeHtml(z.id)}">
                      Pin ${i + 1}: ${escapeHtml(z.label)} (${z.x}%, ${z.y}%)
                    </button>`
                    )
                    .join('')}
                  ${calZoneId ? `<button type="button" class="btn sm" data-cal-done="${escapeHtml(caseObj.id)}">Done placing</button>` : ''}
                </div>
                <div class="verifier-grid">
                  <div>
                    <p style="font-family:var(--mono); font-size:10.5px; text-transform:uppercase; margin:0 0 6px;">Real Slide Photo ${calZoneId ? '(Click image to place Pin)' : ''}</p>
                    ${renderCaseSlideViewer({
                      caseObj,
                      revealedZones: new Set(),
                      mediaMode: 'photo',
                      roomOverrides: ov,
                      showVerifyBadge: false,
                      showModeToggle: false,
                      wrapIdSuffix: '-photo',
                      calibratingZoneId: calZoneId,
                    })}
                  </div>
                  <div>
                    <p style="font-family:var(--mono); font-size:10.5px; text-transform:uppercase; margin:0 0 6px;">Representative H&amp;E Model</p>
                    ${renderCaseSlideViewer({
                      caseObj,
                      revealedZones: new Set(),
                      mediaMode: 'model',
                      roomOverrides: ov,
                      showVerifyBadge: false,
                      showModeToggle: false,
                      wrapIdSuffix: '-model',
                    })}
                  </div>
                </div>
              </div>`
            : `<div class="verifier-grid">
                <div class="verifier-pane">
                  <div style="font-family:var(--mono); font-size:10.5px; margin-bottom:6px;">REAL SPECIMEN (${escapeHtml(entry.license)})</div>
                  ${
                    entry.photoUrl
                      ? `<img loading="lazy" referrerpolicy="no-referrer" src="${escapeHtml(entry.photoUrl)}" alt="${escapeHtml(entry.title)}" />`
                      : `<p class="empty-note" style="padding:36px 12px; text-align:center;">No photo set — uses representative model by default.</p>`
                  }
                </div>
                <div class="verifier-pane">
                  <div style="font-family:var(--mono); font-size:10.5px; margin-bottom:6px;">REPRESENTATIVE MODEL</div>
                  ${oriVis.visualMarkup}
                </div>
              </div>`
        }

        ${
          entry.alternatives?.length
            ? `<div class="btn-row" style="margin-top:8px;">
                <span style="font-family:var(--mono); font-size:11px; color:var(--ink-soft);">Alternatives:</span>
                ${entry.alternatives
                  .map(
                    (alt, idx) =>
                      `<button type="button" class="btn sm" data-ver-alt-id="${escapeHtml(entry.id)}" data-ver-alt-idx="${idx}">${escapeHtml(alt.label)}</button>`
                  )
                  .join('')}
              </div>`
            : ''
        }

        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; align-items:center;">
          <input type="url" class="text-input" style="flex:1; min-width:220px; font-size:12px;" placeholder="Paste custom image URL (https://...)"
            value="${escapeHtml(entry.photoUrl || '')}" data-ver-url-input="${escapeHtml(entry.id)}" />
          <button type="button" class="btn sm" data-ver-apply-url="${escapeHtml(entry.id)}">Use URL</button>
          <label class="btn sm" style="cursor:pointer;">
            Upload local preview
            <input type="file" accept="image/*" style="display:none;" data-ver-upload="${escapeHtml(entry.id)}" />
          </label>
          <select class="text-input" style="font-size:12px;" data-ver-default-mode="${escapeHtml(entry.id)}">
            <option value="photo" ${entry.defaultMode === 'photo' ? 'selected' : ''}>Default: Real Photo</option>
            <option value="model" ${entry.defaultMode === 'model' ? 'selected' : ''}>Default: Rep. Model</option>
          </select>
        </div>
      </div>`;
  }

  function maybeSyncRoom() {
    if (roomSession.roomCode && roomSession.role === 'instructor') {
      roomSession.syncMediaOverrides(loadMediaOverrides());
    }
  }

  function bindEvents(container) {
    container.querySelectorAll('[data-ver-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterKind = btn.dataset.verFilter;
        onRerender();
      });
    });

    container.querySelector('#ver-sync-room')?.addEventListener('click', async () => {
      await roomSession.syncMediaOverrides(loadMediaOverrides());
      alert(`Synced verified images & calibrated pins to Room ${roomSession.roomCode}.`);
    });

    container.querySelector('#ver-export-json')?.addEventListener('click', () => {
      const ov = loadMediaOverrides();
      const merged = Object.fromEntries(
        Object.values(MEDIA_CATALOG).map((m) => [m.id, resolveMediaEntry(m.id, ov)])
      );
      const pins = Object.fromEntries(
        CASES.map((c) => [c.id, resolveCaseZones(c, ov).map((z) => ({ id: z.id, x: z.x, y: z.y }))])
      );
      const blob = new Blob([JSON.stringify({ media: merged, pins }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'imc530-mediaConfig.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    container.querySelector('#ver-reset-all')?.addEventListener('click', () => {
      if (!confirm('Reset all local image overrides, verification badges, and custom pin coordinates?')) return;
      resetAllMediaOverrides();
      activeCalibratingZone = {};
      maybeSyncRoom();
      onRerender();
    });

    container.querySelectorAll('[data-ver-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.verToggle;
        const cur = resolveMediaEntry(id);
        saveMediaOverride(id, { verified: !cur.verified });
        maybeSyncRoom();
        onRerender();
      });
    });

    container.querySelectorAll('[data-ver-alt-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.verAltId;
        const idx = Number(btn.dataset.verAltIdx);
        const alt = MEDIA_CATALOG[id]?.alternatives?.[idx];
        if (!alt) return;
        saveMediaOverride(id, {
          photoUrl: alt.photoUrl,
          attribution: alt.attribution,
          license: alt.license,
          sourcePage: alt.sourcePage,
          defaultMode: 'photo',
        });
        maybeSyncRoom();
        onRerender();
      });
    });

    container.querySelectorAll('[data-ver-apply-url]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.verApplyUrl;
        const input = container.querySelector(`[data-ver-url-input="${id}"]`);
        const url = input?.value?.trim();
        if (!url) return;
        saveMediaOverride(id, {
          photoUrl: url,
          attribution: 'Custom instructor asset',
          license: 'Institutional / Custom',
          sourcePage: null,
          defaultMode: 'photo',
        });
        maybeSyncRoom();
        onRerender();
      });
    });

    container.querySelectorAll('[data-ver-default-mode]').forEach((sel) => {
      sel.addEventListener('change', () => {
        saveMediaOverride(sel.dataset.verDefaultMode, { defaultMode: sel.value });
        maybeSyncRoom();
        onRerender();
      });
    });

    container.querySelectorAll('[data-ver-upload]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1_500_000) {
          alert('Image is larger than 1.5 MB — localStorage preview works best with compressed JPG/PNG (< 1.5 MB), or host the image URL directly.');
        }
        const reader = new FileReader();
        reader.onload = () => {
          saveMediaOverride(input.dataset.verUpload, {
            photoUrl: reader.result,
            attribution: `Uploaded preview (${file.name})`,
            license: 'Local Preview',
            sourcePage: null,
            defaultMode: 'photo',
          });
          maybeSyncRoom();
          onRerender();
        };
        reader.readAsDataURL(file);
      });
    });

    // Pin Calibration
    container.querySelectorAll('[data-cal-case]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCalibratingZone[btn.dataset.calCase] = btn.dataset.calZone;
        onRerender();
      });
    });
    container.querySelectorAll('[data-cal-done]').forEach((btn) => {
      btn.addEventListener('click', () => {
        delete activeCalibratingZone[btn.dataset.calDone];
        onRerender();
      });
    });

    CASES.forEach((c) => {
      const zoneId = activeCalibratingZone[c.id];
      if (!zoneId) return;
      const wrap = container.querySelector(`#slide-wrap-${c.id}-photo`);
      wrap?.addEventListener('click', (e) => {
        if (e.target.classList.contains('zone-pin')) return;
        const rect = wrap.getBoundingClientRect();
        const x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
        savePinOverride(c.id, zoneId, x, y);
        maybeSyncRoom();
        onRerender();
      });
    });
  }

  return { render, bindEvents };
}
