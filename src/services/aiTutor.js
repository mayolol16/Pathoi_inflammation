import { getAISettings } from '../config/firebaseConfig.js';

export function isLiveAIConfigured() {
  const s = getAISettings();
  return (s.provider === 'gemini' && Boolean(s.geminiKey)) || (s.provider === 'proxy' && Boolean(s.proxyUrl));
}

/**
 * Sends a student or instructor follow-up question to an optional configured
 * Gemini API key or custom proxy endpoint.
 */
export async function askLiveAI(question, caseContext, history = []) {
  const s = getAISettings();
  const cleanQuestion = String(question || '').trim().slice(0, 600);
  const cleanContext = String(caseContext || '').trim().slice(0, 800);
  const cleanHistory = Array.isArray(history)
    ? history.slice(-4).map((t) => ({ role: t.role, text: String(t.text || '').slice(0, 600) }))
    : [];

  if (s.provider === 'proxy' && s.proxyUrl) {
    const res = await fetch(s.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: cleanQuestion,
        caseContext: cleanContext,
        history: cleanHistory,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `AI tutor error (${res.status})`);
    }
    return data.answer || data.text || 'No response generated.';
  }

  if (s.provider === 'gemini' && s.geminiKey) {
    const systemInstruction = `You are a pathology tutor for UB Jacobs School of Medicine IMC 530 (Acute & Chronic Inflammation). Keep answers concise, clinically accurate, Socratic when helpful, and tailored to first-year medical students.\n\nCurrent case context:\n${cleanContext}`;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(s.geminiKey)}`;
    const contents = [
      ...cleanHistory.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      { role: 'user', parts: [{ text: cleanQuestion }] },
    ];
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 140)}`);
    }
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
  }

  throw new Error('No live AI key or proxy configured.');
}
