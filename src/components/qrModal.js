import QRCode from 'qrcode';
import { escapeHtml } from '../utils/html.js';

let modalRoot = null;
let escHandler = null;

function ensureRoot() {
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'qr-modal-root';
    document.body.appendChild(modalRoot);
  }
  return modalRoot;
}

export function closeQRModal() {
  if (escHandler) {
    window.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
  if (modalRoot) modalRoot.innerHTML = '';
}

export async function openQRModal(roomCode) {
  const root = ensureRoot();
  if (escHandler) window.removeEventListener('keydown', escHandler);
  escHandler = (e) => {
    if (e.key === 'Escape') closeQRModal();
  };
  window.addEventListener('keydown', escHandler);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  const joinUrl = `${baseUrl}#/join/${encodeURIComponent(roomCode)}`;

  let svgMarkup = '';
  try {
    svgMarkup = await QRCode.toString(joinUrl, {
      type: 'svg',
      margin: 1,
      color: { dark: '#1c1a17', light: '#ffffff' },
    });
  } catch {
    svgMarkup = '<p class="empty-note">Could not generate QR SVG.</p>';
  }

  root.innerHTML = `
    <div class="modal-backdrop" id="qr-backdrop">
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="Join Classroom QR">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <h3 style="margin:0; font-size:20px; font-weight:400;">Join Live Pathology Session</h3>
          <button type="button" class="icon-btn" id="qr-close-btn">Close ✕</button>
        </div>
        <p class="hint" style="margin-bottom:8px;">Students scan this QR code on their phone or enter the room code at the top of the student page.</p>
        <div style="text-align:center; margin:10px 0;">
          <span class="room-pill" style="font-size:22px; padding:8px 18px; letter-spacing:0.18em;">${escapeHtml(roomCode)}</span>
        </div>
        <div class="qr-box">${svgMarkup}</div>
        <div style="display:flex; gap:8px; align-items:center; margin-top:12px;">
          <input type="text" class="text-input" style="flex:1; font-size:12px;" readonly value="${escapeHtml(joinUrl)}" id="qr-url-input" />
          <button type="button" class="btn sm primary" id="qr-copy-btn">Copy link</button>
        </div>
      </div>
    </div>`;

  root.querySelector('#qr-close-btn')?.addEventListener('click', closeQRModal);
  root.querySelector('#qr-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'qr-backdrop') closeQRModal();
  });
  root.querySelector('#qr-copy-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      const btn = root.querySelector('#qr-copy-btn');
      if (btn) btn.textContent = 'Copied ✓';
    } catch {
      root.querySelector('#qr-url-input')?.select();
    }
  });
}
