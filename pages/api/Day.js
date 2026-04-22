import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  const { date } = req.query

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date' })
  }

  const key = `day:${date}`

  if (req.method === 'GET') {
    try {
      const data = await kv.get(key)
      return res.status(200).json(data || null)
    } catch (e) {
      return res.status(500).json({ error: 'Failed to load' })
    }
  }

  if (req.method === 'POST') {
    try {
      await kv.set(key, req.body)
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save' })
    }
  }

  if (req.method === 'GET' && req.query.all === 'true') {
    try {
      const keys = await kv.keys('day:*')
      return res.status(200).json(keys)
    } catch (e) {
      return res.status(500).json({ error: 'Failed to list' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}