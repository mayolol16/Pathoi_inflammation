import { resolveMediaEntry, resolveCaseZones } from '../data/mediaCatalog.js';
import { renderCaseModelSVG, renderOrientationModelSVG } from './models.js';
import { escapeHtml } from '../utils/html.js';

// Persist zoom & pan state per targetKey across view re-renders
const zoomStateMap = new Map();

function getZoomState(key) {
  if (!zoomStateMap.has(key)) {
    zoomStateMap.set(key, { zoom: 1, tx: 0, ty: 0 });
  }
  return zoomStateMap.get(key);
}

function renderOverlays({
  pins = [],
  revealedZones = new Set(),
  spotlightZoneId = null,
  calibratingZoneId = null,
  annotations = [],
  livePointer = null,
  isInstructor = false,
  targetKey = '',
}) {
  const pinsHtml = pins
    .map((z, i) => {
      const isRevealed = revealedZones.has(z.id);
      const isSpot = spotlightZoneId === z.id || calibratingZoneId === z.id;
      return `<button type="button"
        class="zone-pin ${isRevealed ? 'revealed' : ''} ${isSpot ? 'spotlight' : ''}"
        style="left:${z.x}%; top:${z.y}%;"
        data-zone-id="${escapeHtml(z.id)}"
        data-zone-idx="${i}"
        title="${escapeHtml(z.label || z.id)}">${i + 1}</button>`;
    })
    .join('');

  const labelsHtml = (annotations || [])
    .map(
      (a) => `
      <div class="inst-label-pin" style="left:${a.x}%; top:${a.y}%;" title="${escapeHtml(a.text)}">
        <span>🏷️ ${escapeHtml(a.text)}</span>
        ${
          isInstructor
            ? `<button type="button" class="inst-label-del" data-del-label-id="${escapeHtml(a.id)}" data-del-target="${escapeHtml(targetKey)}" title="Remove label">×</button>`
            : ''
        }
      </div>`
    )
    .join('');

  const pointerHtml = livePointer && livePointer.targetKey === targetKey
    ? `<div class="live-pointer" style="left:${livePointer.x}%; top:${livePointer.y}%;"><div class="live-pointer-dot"></div></div>`
    : '';

  return `
    <div style="position:absolute; inset:0; pointer-events:none;">
      <div style="position:relative; width:100%; height:100%; pointer-events:auto;">
        ${pinsHtml}
        ${labelsHtml}
        ${pointerHtml}
      </div>
    </div>`;
}

function renderZoomToolbar(targetKey) {
  const zs = getZoomState(targetKey);
  const pct = Math.round(zs.zoom * 100);
  return `
    <div class="zoom-toolbar" data-zoom-toolbar="${escapeHtml(targetKey)}">
      <div class="zoom-controls">
        <button type="button" class="zoom-btn" data-zoom-act="out" title="Zoom out">−</button>
        <span class="zoom-readout">${pct}%</span>
        <button type="button" class="zoom-btn" data-zoom-act="in" title="Zoom in">+</button>
        <button type="button" class="zoom-btn" data-zoom-act="reset" title="Reset zoom & pan">Reset</button>
      </div>
      <span>Scroll or click + to zoom · Drag to pan</span>
    </div>`;
}

/**
 * Renders an Orientation visual (Real Specimen photo OR Representative SVG model)
 * with zoom/pan, clickable feature pins, instructor labels, and live pointer.
 */
export function renderOrientationVisual({
  itemId,
  shown,
  mediaMode,
  roomOverrides = null,
  onToggleModeAttr = '',
  features = [],
  revealedFeatures = new Set(),
  spotlightFeatureId = null,
  annotations = [],
  livePointer = null,
  isInstructor = false,
  toolActive = false,
}) {
  const mediaKey = `${itemId}:${shown}`;
  const entry = resolveMediaEntry(mediaKey, roomOverrides);
  const hasPhoto = Boolean(entry?.photoUrl);
  const effectiveMode = hasPhoto ? (mediaMode || entry.defaultMode || 'photo') : 'model';
  const zs = getZoomState(mediaKey);

  const visualMarkup = effectiveMode === 'photo' && hasPhoto
    ? `<img class="specimen-photo" decoding="sync" src="${escapeHtml(entry.photoUrl)}" alt="${escapeHtml(entry.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
       <div style="display:none; width:100%;">${renderOrientationModelSVG(itemId, shown)}<p class="empty-note" style="color:#e0b25c; margin-top:8px;">External photo unavailable — showing representative model.</p></div>`
    : renderOrientationModelSVG(itemId, shown);

  const overlays = renderOverlays({
    pins: effectiveMode === 'photo' ? features : [],
    revealedZones: revealedFeatures,
    spotlightZoneId: spotlightFeatureId,
    annotations,
    livePointer,
    isInstructor,
    targetKey: mediaKey,
  });

  const interactiveStage = `
    <div style="width:100%;">
      ${renderZoomToolbar(mediaKey)}
      <div class="zoom-viewport ${zs.zoom > 1 ? 'is-zoomed' : ''} ${toolActive ? 'tool-active' : ''}" data-zoom-viewport="${escapeHtml(mediaKey)}">
        <div class="zoom-surface" style="transform:translate(${zs.tx}px, ${zs.ty}px) scale(${zs.zoom}); --zoom:${zs.zoom};">
          <div class="slide-img-wrap" id="ori-wrap-${escapeHtml(itemId)}">
            ${visualMarkup}
            ${overlays}
          </div>
        </div>
      </div>
    </div>`;

  const toggleHtml = `
    <div class="media-header-row" style="width:100%;">
      <div class="segmented-toggle" ${onToggleModeAttr}>
        <button type="button" class="${effectiveMode === 'photo' ? 'active' : ''}" ${!hasPhoto ? 'disabled title="No real photo set yet — add one in Verify Images"' : ''} data-media-mode="photo">Real Specimen</button>
        <button type="button" class="${effectiveMode === 'model' ? 'active' : ''}" data-media-mode="model">Representative Model</button>
      </div>
      <span class="verify-pill ${entry?.verified ? 'ok' : 'pending'}">${entry?.verified ? 'Verified ✓' : 'Pending Verification'}</span>
    </div>`;

  const attrLine = effectiveMode === 'photo' && hasPhoto
    ? `<span>Source: ${escapeHtml(entry.attribution)} (${escapeHtml(entry.license)})${entry.sourcePage ? ` · <a href="${escapeHtml(entry.sourcePage)}" target="_blank" rel="noopener">Atlas</a>` : ''}</span>`
    : `<span>${escapeHtml(entry?.attribution || 'Representative SVG model')}</span>`;

  return {
    toggleHtml,
    visualMarkup: interactiveStage,
    attrLine,
    effectiveMode,
    entry,
    mediaKey,
  };
}

/**
 * Renders the Case Slide Viewer with Zoom/Pan, Real Photo vs Model toggle,
 * interactive zone pins, instructor labels, live pointer, and attribution footer.
 */
export function renderCaseSlideViewer({
  caseObj,
  revealedZones = new Set(),
  mediaMode = null,
  spotlightZoneId = null,
  roomOverrides = null,
  showVerifyBadge = true,
  showModeToggle = true,
  wrapIdSuffix = '',
  calibratingZoneId = null,
  annotations = [],
  livePointer = null,
  isInstructor = false,
  toolActive = false,
  enableZoom = true,
}) {
  const entry = resolveMediaEntry(caseObj.id, roomOverrides);
  const zones = resolveCaseZones(caseObj, roomOverrides);
  const hasPhoto = Boolean(entry?.photoUrl);
  const effectiveMode = hasPhoto ? (mediaMode || entry.defaultMode || 'photo') : 'model';
  const zs = enableZoom ? getZoomState(caseObj.id) : { zoom: 1, tx: 0, ty: 0 };

  const mediaContent = effectiveMode === 'photo' && hasPhoto
    ? `<img class="specimen-photo" decoding="sync" src="${escapeHtml(entry.photoUrl)}" alt="${escapeHtml(caseObj.image.placeholderLabel)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
       <div style="display:none; width:100%;">${renderCaseModelSVG(caseObj.id)}</div>`
    : renderCaseModelSVG(caseObj.id);

  const overlays = renderOverlays({
    pins: zones,
    revealedZones,
    spotlightZoneId,
    calibratingZoneId,
    annotations,
    livePointer,
    isInstructor,
    targetKey: caseObj.id,
  });

  const attrText = effectiveMode === 'photo' && hasPhoto
    ? `${escapeHtml(entry.attribution)} (${escapeHtml(entry.license)})${entry.sourcePage ? ` · <a href="${escapeHtml(entry.sourcePage)}" target="_blank" rel="noopener">Source</a>` : ''}`
    : 'Built-in representative H&E histology model';

  const headerHtml = showModeToggle || showVerifyBadge
    ? `<div class="media-header-row">
        ${
          showModeToggle
            ? `<div class="segmented-toggle" data-case-media-toggle="${escapeHtml(caseObj.id)}">
                <button type="button" class="${effectiveMode === 'photo' ? 'active' : ''}" ${!hasPhoto ? 'disabled' : ''} data-media-mode="photo">Real Slide Photo</button>
                <button type="button" class="${effectiveMode === 'model' ? 'active' : ''}" data-media-mode="model">Representative Model</button>
              </div>`
            : '<span></span>'
        }
        ${showVerifyBadge ? `<span class="verify-pill ${entry?.verified ? 'ok' : 'pending'}">${entry?.verified ? 'Verified ✓' : 'Pending Verification'}</span>` : ''}
      </div>`
    : '';

  const stageBody = `
    <div class="slide-stage">
      <div class="slide-img-wrap ${calibratingZoneId ? 'calibrating' : ''}" id="slide-wrap-${escapeHtml(caseObj.id)}${escapeHtml(wrapIdSuffix)}">
        ${mediaContent}
        ${overlays}
      </div>
    </div>`;

  return `
    ${headerHtml}
    <div class="slide-frame">
      ${enableZoom ? renderZoomToolbar(caseObj.id) : ''}
      ${
        enableZoom
          ? `<div class="zoom-viewport ${zs.zoom > 1 ? 'is-zoomed' : ''} ${toolActive ? 'tool-active' : ''}" data-zoom-viewport="${escapeHtml(caseObj.id)}">
              <div class="zoom-surface" style="transform:translate(${zs.tx}px, ${zs.ty}px) scale(${zs.zoom}); --zoom:${zs.zoom};">
                ${stageBody}
              </div>
            </div>`
          : stageBody
      }
      <div class="slide-caption-bar">
        <span>${revealedZones.size} of ${zones.length} zones examined</span>
        <span>${attrText}</span>
      </div>
    </div>`;
}

/**
 * Wires smooth CSS-transform zoom, drag-to-pan, wheel zoom, and clean
 * click-vs-drag image coordinate placement (for instructor point/label tools).
 */
export function attachInteractiveViewer(container, targetKey, { onImageClick = null } = {}) {
  if (!container || !targetKey) return;
  const toolbar = container.querySelector(`[data-zoom-toolbar="${targetKey}"]`);
  const viewport = container.querySelector(`[data-zoom-viewport="${targetKey}"]`);
  if (!viewport) return;
  const surface = viewport.querySelector('.zoom-surface');
  const imgWrap = viewport.querySelector('.slide-img-wrap');
  const readout = toolbar?.querySelector('.zoom-readout');
  const state = getZoomState(targetKey);

  const clampPan = () => {
    if (state.zoom <= 1) {
      state.tx = 0;
      state.ty = 0;
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const maxX = Math.max(80, ((state.zoom - 1) * rect.width) / 2 + 40);
    const maxY = Math.max(80, ((state.zoom - 1) * rect.height) / 2 + 40);
    state.tx = Math.max(-maxX, Math.min(maxX, state.tx));
    state.ty = Math.max(-maxY, Math.min(maxY, state.ty));
  };

  const applyTransform = () => {
    clampPan();
    if (surface) {
      surface.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.zoom})`;
      surface.style.setProperty('--zoom', String(state.zoom));
    }
    viewport.classList.toggle('is-zoomed', state.zoom > 1);
    if (readout) readout.textContent = `${Math.round(state.zoom * 100)}%`;
  };

  const setZoom = (nextZoom) => {
    state.zoom = Math.max(1, Math.min(4, Number(nextZoom.toFixed(2))));
    if (state.zoom === 1) {
      state.tx = 0;
      state.ty = 0;
    }
    applyTransform();
  };

  toolbar?.querySelectorAll('[data-zoom-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.zoomAct;
      if (act === 'in') setZoom(state.zoom + 0.5);
      else if (act === 'out') setZoom(state.zoom - 0.5);
      else setZoom(1);
    });
  });

  viewport.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey || state.zoom > 1) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        setZoom(state.zoom + delta);
      }
    },
    { passive: false }
  );

  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startTx = 0;
  let startTy = 0;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('button')) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    startTx = state.tx;
    startTy = state.ty;
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.hypot(dx, dy) > 5) moved = true;
    if (state.zoom > 1 && moved) {
      state.tx = startTx + dx;
      state.ty = startTy + dy;
      applyTransform();
    }
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    if (!moved && onImageClick && imgWrap && !e.target.closest('button')) {
      const rect = imgWrap.getBoundingClientRect();
      if (
        rect.width > 0 &&
        rect.height > 0 &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        const x = Number(Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100)).toFixed(1));
        const y = Number(Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100)).toFixed(1));
        onImageClick(x, y);
      }
    }
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', () => { dragging = false; });

  applyTransform();
}
