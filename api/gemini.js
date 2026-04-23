export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { contents, system_instruction } = req.body;
  const apiKey = "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";

    // Converte formato Gemini para OpenRouter/OpenAI
    const messages = [];
    if (system_instruction) {
      messages.push({ role: 'system', content: system_instruction });
    }
    for (const c of contents) {
      const role = c.role === 'model' ? 'assistant' : 'user';
      const text = c.parts.map(p => p.text || '').join('');
      messages.push({ role, content: text });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://pipefy-insight.vercel.app',
        'X-Title': 'Pipefy Insight AI'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages,
        temperature: 0.3,
        max_tokens: 2048
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.choices?.[0]?.message?.content || '';

    // Retorna no formato que o frontend espera (igual Gemini)
    return res.status(200).json({
      candidates: [{ content: { parts: [{ text }] } }]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
