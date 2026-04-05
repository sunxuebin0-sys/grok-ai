import fs from 'fs'
import jwt from 'jsonwebtoken'

const HISTORY_FILE = '/tmp/history.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch { return null }
}

function readHistory() {
  try { return fs.existsSync(HISTORY_FILE) ? JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8')) : {} } catch { return {} }
}

function writeHistory(h) { fs.writeFileSync(HISTORY_FILE, JSON.stringify(h, null, 2)) }

export default function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1]
  const user = verifyToken(token)
  if (!user) return res.status(401).json({ error: '未授权' })

  const username = user.username
  const history = readHistory()

  if (req.method === 'GET') {
    return res.status(200).json({ history: history[username] || [] })
  }

  if (req.method === 'POST') {
    const { messages, title } = req.body
    if (!messages) return res.status(400).json({ error: '消息不能为空' })
    if (!history[username]) history[username] = []
    const item = {
      id: Date.now().toString(),
      title: title || messages[0]?.content?.slice(0, 30) || '对话',
      messages,
      createdAt: new Date().toISOString()
    }
    history[username].unshift(item)
    if (history[username].length > 50) history[username] = history[username].slice(0, 50)
    writeHistory(history)
    return res.status(200).json({ id: item.id })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    if (id) {
      history[username] = (history[username] || []).filter(item => item.id !== id)
    } else {
      history[username] = []
    }
    writeHistory(history)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
