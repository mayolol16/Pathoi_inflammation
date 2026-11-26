import {
  clearFirebaseConfig,
  getAISettings,
  getFirebaseConfig,
  getInstructorPasscode,
  saveAISettings,
  saveFirebaseConfig,
  saveInstructorPasscode,
} from '../config/firebaseConfig.js';
import { escapeHtml } from '../utils/html.js';

let modalRoot = null;
let escHandler = null;

function ensureRoot() {
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'settings-modal-root';
    document.body.appendChild(modalRoot);
  }
  return modalRoot;
}

export function closeSettingsModal() {
  if (escHandler) {
    window.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
  if (modalRoot) modalRoot.innerHTML = '';
}

function parseFirebaseSnippet(raw) {
  const txt = raw.trim();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    // Support JS object literal pasted from Firebase console: { apiKey: "...", ... }
    const keys = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const out = {};
    keys.forEach((k) => {
      const m = txt.match(new RegExp(`${k}\\s*:\\s*["']([^"']+)["']`));
      if (m) out[k] = m[1];
    });
    return out.apiKey && out.databaseURL ? out : null;
  }
}

export function openSettingsModal(onSaved) {
  const root = ensureRoot();
  if (escHandler) window.removeEventListener('keydown', escHandler);
  escHandler = (e) => {
    if (e.key === 'Escape') closeSettingsModal();
  };
  window.addEventListener('keydown', escHandler);
  const fb = getFirebaseConfig() || {};
  const ai = getAISettings();
  const curPass = getInstructorPasscode();

  root.innerHTML = `
    <div class="modal-backdrop" id="settings-backdrop">
      <div class="modal-card" role="dialog" aria-modal="true" aria-label="Sync & Tutor Settings">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px;">
          <h3 style="margin:0; font-size:20px; font-weight:400;">Classroom Sync &amp; Settings</h3>
          <button type="button" class="icon-btn" id="settings-close-btn">Close ✕</button>
        </div>

        <div class="drawer-section" style="margin-bottom:12px;">
          <h4>1. Multi-Device Live Polling (Firebase Realtime Database)</h4>
          <p class="hint" style="margin:4px 0 8px;">
            Currently using: <b>${fb.apiKey ? `Firebase (${escapeHtml(fb.projectId)}) [${fb.source}]` : 'Local Multi-Tab Sync (same browser)'}</b>.
            Paste your Firebase Web App config object below to enable live student phones on GitHub Pages.
          </p>
          <textarea id="fb-snippet" class="reasoning" style="font-family:var(--mono); font-size:12px; min-height:92px;" placeholder='Paste Firebase config JSON or JS snippet: { "apiKey": "...", "databaseURL": "https://...-default-rtdb.firebaseio.com", "projectId": "..." }'>${fb.apiKey ? escapeHtml(JSON.stringify({
            apiKey: fb.apiKey,
            authDomain: fb.authDomain || '',
            databaseURL: fb.databaseURL,
            projectId: fb.projectId,
            storageBucket: fb.storageBucket || '',
            messagingSenderId: fb.messagingSenderId || '',
            appId: fb.appId || '',
          }, null, 2)) : ''}</textarea>
          <div class="btn-row" style="margin-top:8px;">
            <button type="button" class="btn sm primary" id="fb-save-btn">Save &amp; Connect Firebase</button>
            <button type="button" class="btn sm" id="fb-clear-btn">Use Local Multi-Tab Only</button>
          </div>
          <p id="fb-status-msg" style="font-size:12.5px; margin:8px 0 0; color:var(--ink-soft);"></p>
        </div>

        <div class="drawer-section" style="margin-bottom:12px;">
          <h4>2. Instructor Console Passcode</h4>
          <p class="hint" style="margin:4px 0 8px;">Default is <code>IMC530</code>. Stored in this browser unless set via <code>VITE_INSTRUCTOR_PASSCODE</code>.</p>
          <div style="display:flex; gap:8px;">
            <input type="text" class="text-input" id="passcode-input" value="${escapeHtml(curPass)}" style="flex:1;" />
            <button type="button" class="btn sm" id="passcode-save-btn">Update passcode</button>
          </div>
          <p id="passcode-status-msg" style="font-size:12.5px; margin:8px 0 0; color:var(--vital-ink);"></p>
        </div>

        <div class="drawer-section">
          <h4>3. Optional Live AI Tutor (for open-ended Q&amp;A)</h4>
          <p class="hint" style="margin:4px 0 8px;">Curated medical explanations work without any API key. Optionally attach a Gemini key (local browser only) or backend proxy.</p>
          <select id="ai-provider" class="text-input" style="width:100%; margin-bottom:8px;">
            <option value="none" ${ai.provider === 'none' ? 'selected' : ''}>Disabled (Curated explanations only)</option>
            <option value="gemini" ${ai.provider === 'gemini' ? 'selected' : ''}>Gemini API Key (browser-side)</option>
            <option value="proxy" ${ai.provider === 'proxy' ? 'selected' : ''}>Custom Backend Proxy URL</option>
          </select>
          <input type="password" id="ai-gemini-key" class="text-input" style="width:100%; margin-bottom:8px;" placeholder="Gemini API key (AIza...)" value="${escapeHtml(ai.geminiKey || '')}" />
          <input type="url" id="ai-proxy-url" class="text-input" style="width:100%; margin-bottom:8px;" placeholder="https://your-worker.example.com/tutor" value="${escapeHtml(ai.proxyUrl || '')}" />
          <button type="button" class="btn sm" id="ai-save-btn">Save AI Settings</button>
          <p id="ai-status-msg" style="font-size:12.5px; margin:8px 0 0; color:var(--vital-ink);"></p>
        </div>
      </div>
    </div>`;

  root.querySelector('#settings-close-btn')?.addEventListener('click', closeSettingsModal);
  root.querySelector('#settings-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'settings-backdrop') closeSettingsModal();
  });

  root.querySelector('#fb-save-btn')?.addEventListener('click', () => {
    const raw = root.querySelector('#fb-snippet')?.value || '';
    const parsed = parseFirebaseSnippet(raw);
    const msg = root.querySelector('#fb-status-msg');
    if (!parsed || !parsed.apiKey || !parsed.databaseURL || !parsed.projectId) {
      msg.textContent = 'Invalid config: need at least apiKey, databaseURL, and projectId.';
      return;
    }
    saveFirebaseConfig(parsed);
    msg.textContent = 'Saved Firebase config. Reconnecting room…';
    if (onSaved) onSaved('firebase');
  });

  root.querySelector('#fb-clear-btn')?.addEventListener('click', () => {
    clearFirebaseConfig();
    const msg = root.querySelector('#fb-status-msg');
    msg.textContent = 'Cleared local Firebase config. Switched to Local Multi-Tab Sync.';
    if (onSaved) onSaved('local');
  });

  root.querySelector('#passcode-save-btn')?.addEventListener('click', () => {
    const val = root.querySelector('#passcode-input')?.value || '';
    saveInstructorPasscode(val);
    const msg = root.querySelector('#passcode-status-msg');
    if (msg) msg.textContent = 'Instructor passcode updated for this browser.';
  });

  root.querySelector('#ai-save-btn')?.addEventListener('click', () => {
    const provider = root.querySelector('#ai-provider')?.value || 'none';
    const geminiKey = root.querySelector('#ai-gemini-key')?.value?.trim() || '';
    const proxyUrl = root.querySelector('#ai-proxy-url')?.value?.trim() || '';
    saveAISettings({ provider, geminiKey, proxyUrl });
    const msg = root.querySelector('#ai-status-msg');
    if (msg) msg.textContent = 'AI Tutor settings saved.';
  });
}
