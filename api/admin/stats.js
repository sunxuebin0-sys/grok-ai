import fs from 'fs'
import crypto from 'crypto'

const DATA_FILE = '/tmp/users.json'
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb'

function verifyToken(token) {
  try {
    const [header, body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.split(' ')[1];
  const user = verifyToken(token);
  if (!user || !user.isAdmin) return res.status(403).json({ error: '无权限' });
  try {
    const users = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) : [];
    const totalChats = users.reduce((s, u) => s + (u.chatCount || 0), 0);
    const totalImages = users.reduce((s, u) => s + (u.imageCount || 0), 0);
    const bannedUsers = users.filter(u => u.banned).length;
    return res.status(200).json({ totalUsers: users.length, totalChats, totalImages, bannedUsers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}