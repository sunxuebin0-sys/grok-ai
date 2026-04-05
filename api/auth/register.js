const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS_FILE = '/tmp/users.json';

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

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名长度应在 3-20 个字符之间' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码长度不能少于 6 位' });
  }

  const users = readUsers();

  const exists = users.find(u => u.username === username);
  if (exists) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    username,
    password: hashedPassword,
    isAdmin: false,
    isBanned: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    chatCount: 0,
    imageCount: 0,
  };

  users.push(newUser);
  writeUsers(users);

  res.status(201).json({ message: '注册成功' });
};
