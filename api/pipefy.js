const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { query, token } = req.body;
    const body = JSON.stringify({ query });

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.pipefy.com',
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(body)
        }
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

    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
