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

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUser(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: '无权限' });
  }

  const users = readUsers();

  const totalUsers = users.length;
  const totalChats = users.reduce((sum, u) => sum + (u.chatCount || 0), 0);
  const totalImages = users.reduce((sum, u) => sum + (u.imageCount || 0), 0);
  const bannedUsers = users.filter(u => u.isBanned).length;

  res.json({ totalUsers, totalChats, totalImages, bannedUsers });
};
