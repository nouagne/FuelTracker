import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const keys = await kv.keys('day:*')
    const dates = keys.map(k => k.replace('day:', '')).sort((a, b) => b.localeCompare(a))
    return res.status(200).json(dates)
  } catch (e) {
    return res.status(500).json({ error: 'Failed to list days' })
  }
}