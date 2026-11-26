import { getAISettings } from '../config/firebaseConfig.js';

export function isLiveAIConfigured() {
  const s = getAISettings();
  return (s.provider === 'gemini' && Boolean(s.geminiKey)) || (s.provider === 'proxy' && Boolean(s.proxyUrl));
}

/**
 * Sends a student or instructor follow-up question to an optional configured
 * Gemini API key or custom proxy endpoint.
 */
export async function askLiveAI(question, caseContext) {
  const s = getAISettings();
  const systemInstruction = `You are a pathology tutor for UB Jacobs School of Medicine IMC 530 (Acute & Chronic Inflammation). Keep answers concise, clinically accurate, Socratic when helpful, and tailored to first-year medical students.\n\nCurrent case context:\n${caseContext}`;

  if (s.provider === 'proxy' && s.proxyUrl) {
    const res = await fetch(s.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, systemInstruction }),
    });
    if (!res.ok) throw new Error(`Proxy error (${res.status})`);
    const data = await res.json();
    return data.answer || data.text || JSON.stringify(data);
  }

  if (s.provider === 'gemini' && s.geminiKey) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(s.geminiKey)}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
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
