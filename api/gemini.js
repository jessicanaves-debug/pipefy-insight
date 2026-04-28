const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const msgs = req.body.messages || [];
    const sys = msgs.find(m => m.role === 'system');
    const rest = msgs.filter(m => m.role !== 'system');
    const contents = rest.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    const payload = { contents, generationConfig: { temperature: 0.3, maxOutputTokens: 2048 } };
    if (sys) payload.system_instruction = { parts: [{ text: sys.content }] };

    const key = process.env.GEMINI_API_KEY;
    const body = JSON.stringify(payload);

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      };
      const r = https.request(options, resp => {
        let d = '';
        resp.on('data', chunk => d += chunk);
        resp.on('end', () => resolve(JSON.parse(d)));
      });
      r.on('error', reject);
      r.write(body);
      r.end();
    });

    if (data.error) throw new Error(data.error.message);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
