module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const r = await fetch('https://api.pipefy.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + req.body.token },
      body: JSON.stringify({ query: req.body.query })
    });
    const d = await r.json();
    res.status(200).json(d);
  } catch(e) { res.status(500).json({ error: e.message }); }
};
