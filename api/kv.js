import { kv } from '@vercel/kv';

function buildKey(key, shared, clientId) {
  const isShared = shared === 'true' || shared === true;
  if (isShared) return 'shared:' + key;
  return 'user:' + (clientId || 'anon') + ':' + key;
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { key, shared, clientId } = req.query;
      if (!key) return res.status(400).json({ error: 'key is required' });
      // health check ping used by the frontend to detect backend availability
      if (key === '__health__') return res.status(200).json({ ok: true });
      const fullKey = buildKey(key, shared, clientId);
      const value = await kv.get(fullKey);
      return res.status(200).json({ value: value === undefined ? null : value });
    }

    if (method === 'POST') {
      const body = req.body || {};
      const { key, value, shared, clientId } = body;
      if (!key) return res.status(400).json({ error: 'key is required' });
      const fullKey = buildKey(key, shared, clientId);
      await kv.set(fullKey, value);
      return res.status(200).json({ ok: true });
    }

    if (method === 'DELETE') {
      const { key, shared, clientId } = req.query;
      if (!key) return res.status(400).json({ error: 'key is required' });
      const fullKey = buildKey(key, shared, clientId);
      await kv.del(fullKey);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('KV API error:', err);
    return res.status(500).json({ error: 'Storage error', detail: String(err && err.message || err) });
  }
}
