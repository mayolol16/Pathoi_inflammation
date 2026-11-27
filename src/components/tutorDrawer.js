import { askLiveAI, isLiveAIConfigured } from '../services/aiTutor.js';
import { escapeHtml } from '../utils/html.js';

let drawerRoot = null;
let currentPayload = null;
let aiAnswerState = { loading: false, text: '', error: '' };
let revealAnswerOpen = false;
let escHandler = null;

function ensureRoot() {
  if (!drawerRoot) {
    drawerRoot = document.createElement('div');
    drawerRoot.id = 'tutor-drawer-root';
    document.body.appendChild(drawerRoot);
  }
  return drawerRoot;
}

export function closeTutorDrawer() {
  currentPayload = null;
  if (escHandler) {
    window.removeEventListener('keydown', escHandler);
    escHandler = null;
  }
  if (drawerRoot) drawerRoot.innerHTML = '';
}

export function openTutorDrawer(payload) {
  currentPayload = payload;
  revealAnswerOpen = false;
  aiAnswerState = { loading: false, text: '', error: '' };
  if (escHandler) window.removeEventListener('keydown', escHandler);
  escHandler = (e) => {
    if (e.key === 'Escape') closeTutorDrawer();
  };
  window.addEventListener('keydown', escHandler);
  renderDrawer();
}

function renderDrawer() {
  const root = ensureRoot();
  if (!currentPayload) {
    root.innerHTML = '';
    return;
  }

  const p = currentPayload;
  let bodyHtml = '';

  if (p.type === 'vignette') {
    bodyHtml = `
      <p class="hint" style="margin-top:0;">${escapeHtml(p.data.summary)}</p>
      ${p.data.sections
        .map(
          (sec) => `
          <div class="drawer-section">
            <h4>${escapeHtml(sec.heading)}</h4>
            <p style="margin:0; font-size:14.5px;">${escapeHtml(sec.body)}</p>
          </div>`
        )
        .join('')}`;
  } else if (p.type === 'differential') {
    bodyHtml = `
      <div class="drawer-section">
        <h4>Anatomical site</h4>
        <p style="margin:0; font-size:14.5px;">${escapeHtml(p.data.site)}</p>
      </div>
      <div class="drawer-section">
        <h4>What it is</h4>
        <p style="margin:0; font-size:14.5px;">${escapeHtml(p.data.summary)}</p>
      </div>
      <div class="drawer-section" style="border-left:4px solid var(--accent);">
        <h4>How it fits this vignette</h4>
        <p style="margin:0; font-size:14.5px;">${escapeHtml(p.data.clue)}</p>
      </div>`;
  } else if (p.type === 'elaborate') {
    const g = p.data;
    bodyHtml = `
      <div class="drawer-section">
        <h4>${escapeHtml(g.tag)} prompt</h4>
        <p style="margin:0; font-size:15px;"><b>${escapeHtml(g.question)}</b></p>
      </div>
      <div class="drawer-section">
        <h4>Think first</h4>
        <p style="margin:0; font-size:14.5px;">${escapeHtml(g.thinkFirst)}</p>
        <div class="btn-row" style="margin-top:12px;">
          <button type="button" class="btn primary sm" id="drawer-reveal-btn">
            ${revealAnswerOpen ? 'Hide explanation' : 'Reveal full explanation'}
          </button>
        </div>
      </div>
      ${
        revealAnswerOpen
          ? `
        <div class="drawer-section" style="border-left:4px solid var(--vital);">
          <h4>Explanation</h4>
          <p style="margin:0; font-size:14.5px; white-space:pre-line;">${escapeHtml(g.modelAnswer)}</p>
        </div>
        <div class="drawer-section" style="background:var(--vital-soft); border-color:var(--vital);">
          <h4 style="color:var(--vital-ink);">Clinical pearl</h4>
          <p style="margin:0; font-size:14px; color:var(--vital-ink);">${escapeHtml(g.clinicalPearl)}</p>
        </div>
        ${
          p.isInstructor && g.facilitation
            ? `<div class="drawer-section" style="background:var(--warn-soft); border-color:var(--warn);">
                <h4 style="color:var(--warn-ink);">Instructor facilitation tip</h4>
                <p style="margin:0; font-size:14px; color:var(--warn-ink);">${escapeHtml(g.facilitation)}</p>
              </div>`
            : ''
        }`
          : ''
      }`;
  } else if (p.type === 'talking-points') {
    const tp = p.data;
    bodyHtml = `
      <div class="drawer-section">
        <h4>Room snapshot</h4>
        <p style="margin:0; font-size:14.5px;">${escapeHtml(tp.summary)}</p>
      </div>
      <div class="drawer-section">
        <h4>Targeted talking points</h4>
        <ul style="margin:6px 0 0; padding-left:18px; font-size:14.5px;">
          ${tp.points.map((pt) => `<li style="margin-bottom:8px;">${escapeHtml(pt)}</li>`).join('')}
        </ul>
      </div>
      <div class="drawer-section" style="border-left:4px solid var(--accent);">
        <h4>Socratic question to ask before revealing the slide</h4>
        <p style="margin:0; font-size:15px;"><b>"${escapeHtml(tp.socraticQuestion)}"</b></p>
      </div>`;
  }

  const aiAvailable = isLiveAIConfigured();
  const aiBlock = `
    <div class="drawer-section" style="margin-top:8px;">
      <h4>Ask a follow-up (Optional Live AI)</h4>
      ${
        aiAvailable
          ? `<textarea id="drawer-ai-input" class="reasoning" style="min-height:56px; margin-top:4px;" placeholder="Ask a follow-up question about this case..."></textarea>
             <div class="btn-row" style="margin-top:8px;">
               <button type="button" class="btn sm primary" id="drawer-ai-send" ${aiAnswerState.loading ? 'disabled' : ''}>
                 ${aiAnswerState.loading ? 'Thinking…' : 'Ask Live AI'}
               </button>
             </div>
             ${aiAnswerState.error ? `<p style="color:var(--accent-ink); font-size:13px; margin:8px 0 0;">${escapeHtml(aiAnswerState.error)}</p>` : ''}
             ${aiAnswerState.text ? `<div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--line); font-size:14px; white-space:pre-line;">${escapeHtml(aiAnswerState.text)}</div>` : ''}`
          : `<p class="empty-note" style="margin:4px 0 0;">All core medical explanations above work 100% offline. To enable open-ended Live AI Q&amp;A, add a Gemini API key or proxy URL in Instructor → Sync &amp; Settings.</p>`
      }
    </div>`;

  root.innerHTML = `
    <div class="drawer-backdrop" id="drawer-backdrop">
      <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(p.title)}">
        <div class="drawer-header">
          <div>
            <p class="stage-kicker" style="margin:0 0 4px;">${escapeHtml(p.kicker || 'Guided Explanation')}</p>
            <h3 style="margin:0; font-size:19px; font-weight:400;">${escapeHtml(p.title)}</h3>
          </div>
          <button type="button" class="icon-btn" id="drawer-close-btn">Close ✕</button>
        </div>
        ${bodyHtml}
        ${aiBlock}
      </div>
    </div>`;

  root.querySelector('#drawer-close-btn')?.addEventListener('click', closeTutorDrawer);
  root.querySelector('#drawer-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'drawer-backdrop') closeTutorDrawer();
  });
  root.querySelector('#drawer-reveal-btn')?.addEventListener('click', () => {
    revealAnswerOpen = !revealAnswerOpen;
    if (revealAnswerOpen && typeof p.onRevealAnswer === 'function') {
      p.onRevealAnswer();
    }
    renderDrawer();
  });
  root.querySelector('#drawer-ai-send')?.addEventListener('click', async () => {
    const q = root.querySelector('#drawer-ai-input')?.value?.trim();
    if (!q) return;
    if (typeof p.onAskAI === 'function') p.onAskAI(q);
    aiAnswerState = { loading: true, text: '', error: '' };
    renderDrawer();
    try {
      const answer = await askLiveAI(q, p.caseContext || p.title);
      aiAnswerState = { loading: false, text: answer, error: '' };
    } catch (err) {
      aiAnswerState = { loading: false, text: '', error: err.message };
    }
    renderDrawer();
  });
}
