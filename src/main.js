import './styles/main.css';
import { createStudentController } from './views/studentView.js';
import { createInstructorController } from './views/instructorView.js';
import { getTheme, setTheme } from './services/storage.js';

const appRoot = document.getElementById('app');

let activeRoute = null; // 'student' | 'instructor'
let activeController = null;

setTheme(getTheme());

function parseHash() {
  const raw = window.location.hash || '#/';
  const path = raw.replace(/^#/, '');
  if (path.startsWith('/instructor')) return { route: 'instructor', tab: 'classroom' };
  if (path.startsWith('/verify')) return { route: 'instructor', tab: 'verify' };
  const joinMatch = path.match(/^\/join\/([A-Za-z0-9]+)/i);
  if (joinMatch) return { route: 'student', joinCode: joinMatch[1].toUpperCase() };
  return { route: 'student', joinCode: null };
}

function renderShell() {
  if (!activeController) return;
  const curTheme = getTheme();
  const nextThemeLabel = curTheme === 'dark' ? 'Light' : curTheme === 'light' ? 'Auto' : 'Dark';
  const isInst = activeRoute === 'instructor';

  appRoot.innerHTML = `
    <div class="wrap">
      <div class="masthead">
        <div class="kicker">
          <span>IMC 530 · Acute &amp; chronic inflammation · UB Jacobs School of Medicine</span>
          <div class="header-actions">
            <button type="button" class="icon-btn" id="theme-toggle-btn" title="Cycle theme">Theme: ${nextThemeLabel}</button>
            ${
              isInst
                ? `<a href="#/" class="icon-btn">Student View ↗</a>`
                : `<a href="#/instructor" class="icon-btn">Instructor Console</a>`
            }
          </div>
        </div>
        <h1>Pathology of acute &amp; chronic inflammation</h1>
        <p class="sub">Three guided cases. Look first, name second.</p>
      </div>
      <div id="view-root">
        ${activeController.render()}
      </div>
      <footer class="site-footer instructor-only">
        <span>UB Jacobs School of Medicine · IMC 530 Active Learning</span>
        <span>
          <a href="#/">Student View</a> ·
          <a href="#/instructor">Instructor Console</a> ·
          <a href="#/verify">Verify Images &amp; Pins</a>
        </span>
      </footer>
    </div>`;

  appRoot.querySelector('#theme-toggle-btn')?.addEventListener('click', () => {
    const cur = getTheme();
    const next = cur === 'auto' ? 'dark' : cur === 'dark' ? 'light' : 'auto';
    setTheme(next);
    renderShell();
  });

  const viewRoot = appRoot.querySelector('#view-root');
  activeController.bindEvents(viewRoot);
}

function syncRoute() {
  const parsed = parseHash();
  if (parsed.route !== activeRoute) {
    if (activeController?.destroy) activeController.destroy();
    activeRoute = parsed.route;
    if (parsed.route === 'instructor') {
      activeController = createInstructorController(renderShell, parsed.tab);
    } else {
      activeController = createStudentController(renderShell);
    }
  } else if (parsed.route === 'instructor' && activeController?.setTab) {
    activeController.setTab(parsed.tab);
  }

  renderShell();

  if (parsed.route === 'student' && parsed.joinCode && activeController?.joinLiveRoom) {
    activeController.joinLiveRoom(parsed.joinCode);
  }
}

window.addEventListener('hashchange', syncRoute);
syncRoute();
