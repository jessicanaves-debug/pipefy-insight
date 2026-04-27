module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const msgs = req.body.messages || [];
    const sys = msgs.find(m => m.role === 'system');
    const rest = msgs.filter(m => m.role !== 'system');
    const contents = rest.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const payload = { contents, generationConfig: { temperature: 0.3, maxOutputTokens: 2048 } };
    if (sys) payload.system_instruction = { parts: [{ text: sys.content }] };
    const key = "AIzaSyBU0L8sGcnPzToWB7g0Yf10vo1-xALIg6w";
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text });
  } catch(e) { res.status(500).json({ error: e.message }); }
};
