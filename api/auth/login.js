const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS_FILE = '/tmp/users.json';
const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  // Admin login
  if (username === ADMIN_USERNAME) {
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: '密码错误' });
    }
    const token = jwt.sign(
      { id: 'admin', username: ADMIN_USERNAME, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: { id: 'admin', username: ADMIN_USERNAME, isAdmin: true },
    });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: '账号已被封禁' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  user.lastLogin = new Date().toISOString();
  writeUsers(users);

  const token = jwt.sign(
    { id: user.id, username: user.username, isAdmin: false },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, isAdmin: false },
  });
};
