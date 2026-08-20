import { Redis } from '@upstash/redis';

// Tích hợp Upstash for Redis trên Vercel có thể đặt tên biến môi trường
// theo 1 trong 2 kiểu tuỳ phiên bản: KV_REST_API_* (kiểu cũ) hoặc
// UPSTASH_REDIS_REST_* (kiểu mới/trực tiếp). Thử cả hai cho chắc.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = (REDIS_URL && REDIS_TOKEN) ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

function buildKey(key, shared, clientId) {
  const isShared = shared === 'true' || shared === true;
  if (isShared) return 'shared:' + key;
  return 'user:' + (clientId || 'anon') + ':' + key;
}

export default async function handler(req, res) {
  const { method } = req;

  if (!redis) {
    return res.status(500).json({
      error: 'Chưa tìm thấy biến môi trường Upstash Redis',
      detail: 'Kiểm tra đã Connect "Upstash for Redis" vào project trên Vercel (tab Storage) và đã Redeploy sau đó chưa.',
    });
  }

  try {
    if (method === 'GET') {
      const { key, shared, clientId } = req.query;
      if (!key) return res.status(400).json({ error: 'key is required' });
      // health check: gọi thật vào Redis để xác nhận đã kết nối, không chỉ trả về thành công cho có
      if (key === '__health__') {
        await redis.set('__health_check__', Date.now());
        return res.status(200).json({ ok: true });
      }
      const fullKey = buildKey(key, shared, clientId);
      const value = await redis.get(fullKey);
      return res.status(200).json({ value: value === undefined ? null : value });
    }

    if (method === 'POST') {
      const body = req.body || {};
      const { key, value, shared, clientId } = body;
      if (!key) return res.status(400).json({ error: 'key is required' });
      const fullKey = buildKey(key, shared, clientId);
      await redis.set(fullKey, value);
      return res.status(200).json({ ok: true });
    }

    if (method === 'DELETE') {
      const { key, shared, clientId } = req.query;
      if (!key) return res.status(400).json({ error: 'key is required' });
      const fullKey = buildKey(key, shared, clientId);
      await redis.del(fullKey);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Redis API error:', err);
    return res.status(500).json({ error: 'Storage error', detail: String(err && err.message || err) });
  }
}
