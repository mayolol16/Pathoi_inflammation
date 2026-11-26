const FIREBASE_LS_KEY = 'imc530_firebase_config';
const PASSCODE_LS_KEY = 'imc530_instructor_passcode';
const AI_SETTINGS_LS_KEY = 'imc530_ai_settings';

export function getFirebaseConfig() {
  const envCfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  if (envCfg.apiKey && envCfg.databaseURL && envCfg.projectId) {
    return { ...envCfg, source: 'env' };
  }

  try {
    const raw = localStorage.getItem(FIREBASE_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.databaseURL && parsed.projectId) {
        return { ...parsed, source: 'local' };
      }
    }
  } catch {
    // ignore storage read error
  }
  return null;
}

export function isFirebaseConfigured() {
  return Boolean(getFirebaseConfig());
}

export function saveFirebaseConfig(cfg) {
  localStorage.setItem(FIREBASE_LS_KEY, JSON.stringify(cfg));
}

export function clearFirebaseConfig() {
  localStorage.removeItem(FIREBASE_LS_KEY);
}

export function getInstructorPasscode() {
  try {
    const custom = localStorage.getItem(PASSCODE_LS_KEY);
    if (custom && custom.trim()) return custom.trim();
  } catch {
    // ignore
  }
  const envCode = import.meta.env.VITE_INSTRUCTOR_PASSCODE;
  return (envCode && envCode.trim()) || 'IMC530';
}

export function isDefaultPasscode() {
  return getInstructorPasscode() === 'IMC530';
}

export function saveInstructorPasscode(newCode) {
  if (!newCode || !newCode.trim()) {
    localStorage.removeItem(PASSCODE_LS_KEY);
  } else {
    localStorage.setItem(PASSCODE_LS_KEY, newCode.trim());
  }
}

export function getAISettings() {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_LS_KEY);
    return raw ? JSON.parse(raw) : { provider: 'none', geminiKey: '', proxyUrl: '' };
  } catch {
    return { provider: 'none', geminiKey: '', proxyUrl: '' };
  }
}

export function saveAISettings(settings) {
  localStorage.setItem(AI_SETTINGS_LS_KEY, JSON.stringify(settings));
}
