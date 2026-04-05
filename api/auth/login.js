import fs from 'fs'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

function readUsers() {
  try { return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : [] } catch { return [] }
}

function writeUsers(u) { fs.writeFileSync(DATA_FILE, JSON.stringify(u, null, 2)) }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' })

  // Admin hardcoded login
  if (username === ADMIN_USERNAME) {
    if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: '用户名或密码错误' })
    const token = jwt.sign({ username: ADMIN_USERNAME, isAdmin: true }, JWT_SECRET, { expiresIn: '7d' })
    return res.status(200).json({ token, user: { username: ADMIN_USERNAME, isAdmin: true } })
  }

  const users = readUsers()
  const user = users.find(u => u.username === username)
  if (!user) return res.status(401).json({ error: '用户名或密码错误' })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: '用户名或密码错误' })
  if (user.banned) return res.status(403).json({ error: '账号已被封禁，请联系管理员' })

  user.lastLogin = new Date().toISOString()
  writeUsers(users)

  const token = jwt.sign({ username: user.username, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' })
  return res.status(200).json({ token, user: { username: user.username, isAdmin: false } })
}
