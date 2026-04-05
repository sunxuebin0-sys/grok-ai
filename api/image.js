import fs from 'fs'
import jwt from 'jsonwebtoken'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'
const GROK_API_KEY = 'xai-FtmlMPaK9PeQIL1ZYUMddBdUY70dlNCDB8kpb6ffpFUMDZYtIWo1Aa56idMSicagImdQV917i44T5yz0'
const GROK_API_BASE = 'https://api.x.ai/v1'
const GROK_IMAGE_MODEL = 'aurora'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch { return null }
}

function readUsers() {
  try { return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : [] } catch { return [] }
}

function writeUsers(u) { fs.writeFileSync(DATA_FILE, JSON.stringify(u, null, 2)) }

function incrementImageCount(username) {
  try {
    const users = readUsers()
    const user = users.find(u => u.username === username)
    if (user) {
      user.imageCount = (user.imageCount || 0) + 1
      writeUsers(users)
    }
  } catch {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.split(' ')[1]
  const user = verifyToken(token)
  if (!user) return res.status(401).json({ error: '未授权' })

  const { prompt, size = '1024x1024', n = 1 } = req.body
  if (!prompt) return res.status(400).json({ error: '请输入图片描述' })

  try {
    const apiRes = await fetch(`${GROK_API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        model: GROK_IMAGE_MODEL,
        prompt,
        n: Math.min(Math.max(parseInt(n) || 1, 1), 4),
        size,
        response_format: 'url'
      })
    })

    const json = await apiRes.json()
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: json.error?.message || '生图失败' })
    }
    const urls = (json.data || []).map(item => item.url).filter(Boolean)
    incrementImageCount(user.username)
    return res.status(200).json({ urls })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
