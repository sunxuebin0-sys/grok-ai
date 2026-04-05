import fs from 'fs'
import crypto from 'crypto'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'
const ADMIN_USERNAME = 'admin'

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

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const token = req.headers.authorization?.split(' ')[1]
  const operator = verifyToken(token)
  if (!operator || !operator.isAdmin) return res.status(403).json({ error: '无权限' })

  const { username, action } = req.body
  if (!username || !action) return res.status(400).json({ error: '参数错误' })
  if (username === ADMIN_USERNAME) return res.status(400).json({ error: '不能操作管理员账号' })

  const users = readUsers()
  const userIdx = users.findIndex(u => u.username === username)

  if (action === 'delete') {
    if (userIdx === -1) return res.status(404).json({ error: '用户不存在' })
    users.splice(userIdx, 1)
    writeUsers(users)
    return res.status(200).json({ ok: true })
  }

  if (action === 'ban' || action === 'unban') {
    if (userIdx === -1) return res.status(404).json({ error: '用户不存在' })
    users[userIdx].banned = action === 'ban'
    writeUsers(users)
    return res.status(200).json({ ok: true })
  }

  return res.status(400).json({ error: '无效操作' })
}
