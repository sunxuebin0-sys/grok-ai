import fs from 'fs'
import https from 'https'
import crypto from 'crypto'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'
const GROK_API_KEY = 'xai-FtmlMPaK9PeQIL1ZYUMddBdUY70dlNCDB8kpb6ffpFUMDZYtIWo1Aa56idMSicagImdQV917i44T5yz0'
const GROK_API_BASE = 'https://api.x.ai/v1'
const GROK_IMAGE_MODEL = 'aurora'

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.')
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url')
    if (sig !== expected) return null
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
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

  const body = JSON.stringify({
    model: GROK_IMAGE_MODEL,
    prompt,
    n: Math.min(Math.max(parseInt(n) || 1, 1), 4),
    size,
    response_format: 'url'
  })

  const url = new URL(`${GROK_API_BASE}/images/generations`)

  return new Promise((resolve) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const apiReq = https.request(options, (apiRes) => {
      let data = ''
      apiRes.on('data', chunk => { data += chunk })
      apiRes.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (apiRes.statusCode !== 200) {
            return res.status(apiRes.statusCode).json({ error: json.error?.message || '生图失败' })
          }
          const urls = (json.data || []).map(item => item.url).filter(Boolean)
          incrementImageCount(user.username)
          res.status(200).json({ urls })
        } catch (e) {
          res.status(500).json({ error: '响应解析失败' })
        }
        resolve()
      })
    })

    apiReq.on('error', (err) => {
      res.status(500).json({ error: err.message })
      resolve()
    })

    apiReq.write(body)
    apiReq.end()
  })
}
