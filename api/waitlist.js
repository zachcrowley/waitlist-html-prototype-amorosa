module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', 'https://amorosaaus.com.au');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.end();
    return;
  }
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  try {
    const r = await fetch('https://join-waitlist-counter.vercel.app/api/waitlist', { method: 'GET', cache: 'no-store' });
    if (!r.ok) throw new Error('upstream error');
    const data = await r.json();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'https://amorosaaus.com.au');
    res.end(JSON.stringify({ displayCount: data.displayCount, serverTs: data.serverTs }));
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', 'https://amorosaaus.com.au');
    res.end(JSON.stringify({ error: 'upstream error' }));
  }
};


