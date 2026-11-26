import { resolveMediaEntry, resolveCaseZones } from '../data/mediaCatalog.js';
import { renderCaseModelSVG, renderOrientationModelSVG } from './models.js';
import { escapeHtml } from '../utils/html.js';

/**
 * Renders an Orientation visual (Real Specimen photo OR Representative SVG model)
 * with toggle and attribution.
 */
export function renderOrientationVisual({
  itemId,
  shown,
  mediaMode, // 'photo' | 'model' | null (defaults to entry.defaultMode)
  roomOverrides = null,
  onToggleModeAttr = '',
}) {
  const mediaKey = `${itemId}:${shown}`;
  const entry = resolveMediaEntry(mediaKey, roomOverrides);
  const hasPhoto = Boolean(entry?.photoUrl);
  const effectiveMode = hasPhoto ? (mediaMode || entry.defaultMode || 'photo') : 'model';

  const visualMarkup = effectiveMode === 'photo' && hasPhoto
    ? `<img class="specimen-photo" decoding="sync" src="${escapeHtml(entry.photoUrl)}" alt="${escapeHtml(entry.title)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
       <div style="display:none; width:100%;">${renderOrientationModelSVG(itemId, shown)}<p class="empty-note" style="color:#e0b25c; margin-top:8px;">External photo unavailable — showing representative model.</p></div>`
    : renderOrientationModelSVG(itemId, shown);

  const toggleHtml = `
    <div class="media-header-row" style="width:100%;">
      <div class="segmented-toggle" ${onToggleModeAttr}>
        <button type="button" class="${effectiveMode === 'photo' ? 'active' : ''}" ${!hasPhoto ? 'disabled title="No real photo set yet — add one in Verify Images"' : ''} data-media-mode="photo">Real Specimen</button>
        <button type="button" class="${effectiveMode === 'model' ? 'active' : ''}" data-media-mode="model">Representative Model</button>
      </div>
      <span class="verify-pill ${entry?.verified ? 'ok' : 'pending'}">${entry?.verified ? 'Verified ✓' : 'Pending Verification'}</span>
    </div>`;

  const attrLine = effectiveMode === 'photo' && hasPhoto
    ? `<span>Source: ${escapeHtml(entry.attribution)} (${escapeHtml(entry.license)})${entry.sourcePage ? ` · <a href="${escapeHtml(entry.sourcePage)}" target="_blank" rel="noopener">Wikimedia</a>` : ''}</span>`
    : `<span>${escapeHtml(entry?.attribution || 'Representative SVG model')}</span>`;

  return {
    toggleHtml,
    visualMarkup,
    attrLine,
    effectiveMode,
    entry,
  };
}

/**
 * Renders the Case Slide Viewer with Real Specimen vs Representative Model toggle,
 * interactive zone pins, instructor spotlight ring, and attribution footer.
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
}) {
  const entry = resolveMediaEntry(caseObj.id, roomOverrides);
  const zones = resolveCaseZones(caseObj, roomOverrides);
  const hasPhoto = Boolean(entry?.photoUrl);
  const effectiveMode = hasPhoto ? (mediaMode || entry.defaultMode || 'photo') : 'model';

  const pinsHtml = zones
    .map((z, i) => {
      const isRevealed = revealedZones.has(z.id);
      const isSpot = spotlightZoneId === z.id || calibratingZoneId === z.id;
      return `<button type="button"
        class="zone-pin ${isRevealed ? 'revealed' : ''} ${isSpot ? 'spotlight' : ''}"
        style="left:${z.x}%; top:${z.y}%;"
        data-zone-id="${escapeHtml(z.id)}"
        data-zone-idx="${i}"
        title="Zone ${i + 1}: ${escapeHtml(z.label || z.id)}">${i + 1}</button>`;
    })
    .join('');

  const mediaContent = effectiveMode === 'photo' && hasPhoto
    ? `<img class="specimen-photo" decoding="sync" src="${escapeHtml(entry.photoUrl)}" alt="${escapeHtml(caseObj.image.placeholderLabel)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
       <div style="display:none; width:100%;">${renderCaseModelSVG(caseObj.id)}</div>`
    : renderCaseModelSVG(caseObj.id);

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

  return `
    ${headerHtml}
    <div class="slide-frame">
      <div class="slide-stage">
        <div class="slide-img-wrap ${calibratingZoneId ? 'calibrating' : ''}" id="slide-wrap-${escapeHtml(caseObj.id)}${escapeHtml(wrapIdSuffix)}">
          ${mediaContent}
          <div style="position:absolute; inset:0; pointer-events:none;">
            <div style="position:relative; width:100%; height:100%; pointer-events:auto;">
              ${pinsHtml}
            </div>
          </div>
        </div>
      </div>
      <div class="slide-caption-bar">
        <span>${revealedZones.size} of ${zones.length} zones examined</span>
        <span>${attrText}</span>
      </div>
    </div>`;
}
