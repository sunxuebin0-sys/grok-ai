import fs from 'fs'
import jwt from 'jsonwebtoken'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'
const GROK_API_KEY = 'xai-FtmlMPaK9PeQIL1ZYUMddBdUY70dlNCDB8kpb6ffpFUMDZYtIWo1Aa56idMSicagImdQV917i44T5yz0'
const GROK_API_BASE = 'https://api.x.ai/v1'
const GROK_CHAT_MODEL = 'grok-3'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch { return null }
}

function readUsers() {
  try { return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : [] } catch { return [] }
}

function writeUsers(u) { fs.writeFileSync(DATA_FILE, JSON.stringify(u, null, 2)) }

function incrementChatCount(username) {
  try {
    const users = readUsers()
    const user = users.find(u => u.username === username)
    if (user) {
      user.chatCount = (user.chatCount || 0) + 1
      writeUsers(users)
    }
  } catch {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.split(' ')[1]
  const user = verifyToken(token)
  if (!user) return res.status(401).json({ error: '未授权' })

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: '消息格式错误' })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const apiRes = await fetch(`${GROK_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({ model: GROK_CHAT_MODEL, messages, stream: true })
    })

    if (!apiRes.ok) {
      const errText = await apiRes.text()
      res.write(`data: ${JSON.stringify({ error: '上游API错误: ' + errText })}\n\n`)
      res.end()
      return
    }

    const reader = apiRes.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(decoder.decode(value, { stream: true }))
    }
    incrementChatCount(user.username)
    res.end()
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
    res.end()
  }
}
