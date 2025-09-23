module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'ADMIN_TOKEN missing' }));
    return;
  }
  try {
    const r = await fetch('https://join-waitlist-counter.vercel.app/api/waitlist/manual-increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
      body: JSON.stringify({ reason: 'join_waitlist_success' }),
      cache: 'no-store'
    });
    if (!r.ok) throw new Error('upstream error');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true }));
  } catch (e) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false }));
  }
};


