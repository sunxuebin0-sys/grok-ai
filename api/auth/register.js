import fs from 'fs'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'
const ADMIN_USERNAME = 'admin'

function createToken(payload) {
  const h = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const b = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7*24*60*60*1000 })).toString('base64url')
  const s = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest('base64url')
  return `${h}.${b}.${s}`
}

function readUsers() {
  try { return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE,'utf-8')) : [] } catch { return [] }
}

function writeUsers(u) { fs.writeFileSync(DATA_FILE, JSON.stringify(u, null, 2)) }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' })
  if (username.length < 3 || username.length > 20) return res.status(400).json({ error: '用户名需3-20位' })
  if (password.length < 6) return res.status(400).json({ error: '密码至少6位' })
  if (username === ADMIN_USERNAME) return res.status(400).json({ error: '用户名已存在' })
  const users = readUsers()
  if (users.find(u => u.username === username)) return res.status(400).json({ error: '用户名已存在' })
  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser = { username, password: hashedPassword, isAdmin: false, banned: false, createdAt: new Date().toISOString(), lastLogin: null, chatCount: 0, imageCount: 0 }
  users.push(newUser)
  writeUsers(users)
  const token = createToken({ username, isAdmin: false })
  return res.status(200).json({ token, user: { username, isAdmin: false } })
}