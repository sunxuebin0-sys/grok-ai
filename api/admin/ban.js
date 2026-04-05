const jwt = require('jsonwebtoken');
const fs = require('fs');

const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb';
const USERS_FILE = '/tmp/users.json';

function getUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

module.exports = async function handler(req, res) {
  const user = getUser(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: '无权限' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '缺少用户 ID' });
  }

  const users = readUsers();
  const target = users.find(u => u.id === id);

  if (!target) {
    return res.status(404).json({ error: '用户不存在' });
  }

  if (target.isAdmin) {
    return res.status(400).json({ error: '不能操作管理员账号' });
  }

  // POST = ban/unban, DELETE = delete user
  if (req.method === 'POST') {
    target.isBanned = !target.isBanned;
    writeUsers(users);
    return res.json({ ok: true, isBanned: target.isBanned });
  }

  if (req.method === 'DELETE') {
    const newUsers = users.filter(u => u.id !== id);
    writeUsers(newUsers);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
