import fs from 'fs'
import jwt from 'jsonwebtoken'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch { return null }
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const token = req.headers.authorization?.split(' ')[1]
  const user = verifyToken(token)
  if (!user || !user.isAdmin) return res.status(403).json({ error: '无权限' })
  try {
    const users = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : []
    const safeUsers = users.map(u => ({
      username: u.username,
      isAdmin: u.isAdmin || false,
      banned: u.banned || false,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      chatCount: u.chatCount || 0,
      imageCount: u.imageCount || 0
    }))
    return res.status(200).json({ users: safeUsers })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
