const STUDENT_STATE_KEY = 'imc530_student_state_v1';
const MEDIA_OVERRIDES_KEY = 'imc530_media_overrides_v1';
const THEME_KEY = 'imc530_theme';
const INSTRUCTOR_AUTH_KEY = 'imc530_instructor_authed';
const LEARNER_ID_KEY = 'imc530_learner_id';

function randomId(prefix = 'stu') {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}_${out}`;
}

export function getOrCreateLearnerId() {
  try {
    let id = localStorage.getItem(LEARNER_ID_KEY);
    if (!id) {
      id = randomId('lrn');
      localStorage.setItem(LEARNER_ID_KEY, id);
    }
    return id;
  } catch {
    return randomId('lrn');
  }
}

export function getOrCreateClientId(prefix = 'stu') {
  const key = `imc530_client_id_${prefix}`;
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = randomId(prefix);
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return randomId(prefix);
  }
}

export function loadStudentProgress() {
  try {
    const raw = localStorage.getItem(STUDENT_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStudentProgress(patch) {
  try {
    const cur = loadStudentProgress();
    const next = { ...cur, ...patch };
    localStorage.setItem(STUDENT_STATE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return patch;
  }
}

export function loadMediaOverrides() {
  try {
    const raw = localStorage.getItem(MEDIA_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMediaOverride(mediaId, patch) {
  const cur = loadMediaOverrides();
  const next = {
    ...cur,
    [mediaId]: { ...(cur[mediaId] || {}), ...patch },
  };
  localStorage.setItem(MEDIA_OVERRIDES_KEY, JSON.stringify(next));
  return next;
}

export function savePinOverride(caseId, zoneId, x, y) {
  const key = `${caseId}:pins`;
  const cur = loadMediaOverrides();
  const next = {
    ...cur,
    [key]: {
      ...(cur[key] || {}),
      [zoneId]: { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) },
    },
  };
  localStorage.setItem(MEDIA_OVERRIDES_KEY, JSON.stringify(next));
  return next;
}

export function resetAllMediaOverrides() {
  localStorage.removeItem(MEDIA_OVERRIDES_KEY);
}

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'auto';
  } catch {
    return 'auto';
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
  if (theme === 'dark' || theme === 'light') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function isInstructorAuthed() {
  try {
    return sessionStorage.getItem(INSTRUCTOR_AUTH_KEY) === '1';
  } catch {
    return false;
  }
}

export function setInstructorAuthed(val) {
  try {
    if (val) sessionStorage.setItem(INSTRUCTOR_AUTH_KEY, '1');
    else sessionStorage.removeItem(INSTRUCTOR_AUTH_KEY);
  } catch {
    // ignore
  }
}
