const FIREBASE_LS_KEY = 'imc530_firebase_config';
const PASSCODE_LS_KEY = 'imc530_instructor_passcode';
const AI_SETTINGS_LS_KEY = 'imc530_ai_settings';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAhSAtH8zRp892iRPMduOtg0zlMsUAg5eg',
  authDomain: 'immunopatho-5bfec.firebaseapp.com',
  databaseURL: 'https://immunopatho-5bfec-default-rtdb.firebaseio.com',
  projectId: 'immunopatho-5bfec',
  storageBucket: 'immunopatho-5bfec.firebasestorage.app',
  messagingSenderId: '939279007810',
  appId: '1:939279007810:web:f04b414eb5d453bcd92ddb',
};

export function getFirebaseConfig() {
  try {
    const raw = localStorage.getItem(FIREBASE_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.disabled) return null;
      if (parsed.apiKey && parsed.databaseURL && parsed.projectId) {
        return { ...parsed, source: 'local' };
      }
    }
  } catch {
    // ignore storage read error
  }

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

  return { ...DEFAULT_FIREBASE_CONFIG, source: 'embedded' };
}

export function isFirebaseConfigured() {
  return Boolean(getFirebaseConfig());
}

export function saveFirebaseConfig(cfg) {
  localStorage.setItem(FIREBASE_LS_KEY, JSON.stringify(cfg));
}

export function clearFirebaseConfig() {
  localStorage.setItem(FIREBASE_LS_KEY, JSON.stringify({ disabled: true }));
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

export const DEFAULT_AI_PROXY_URL = 'https://imc530-ai-tutor.imc530-ub-pathology.workers.dev';

export function getAISettings() {
  const envProxy = import.meta.env.VITE_AI_PROXY_URL || DEFAULT_AI_PROXY_URL;
  try {
    const raw = localStorage.getItem(AI_SETTINGS_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.provider) {
        // Auto-upgrade legacy pre-proxy 'none' entries unless explicitly disabled after proxy rollout
        if (parsed.provider === 'none' && !parsed.explicit) {
          return { provider: 'proxy', geminiKey: '', proxyUrl: envProxy, source: 'embedded' };
        }
        if (parsed.provider === 'proxy' && !parsed.proxyUrl) {
          return { ...parsed, proxyUrl: envProxy, source: 'embedded' };
        }
        return parsed;
      }
    }
  } catch {
    // ignore storage read error
  }
  return { provider: 'proxy', geminiKey: '', proxyUrl: envProxy, source: 'embedded' };
}

export function saveAISettings(settings) {
  localStorage.setItem(AI_SETTINGS_LS_KEY, JSON.stringify({ ...settings, explicit: true }));
}
