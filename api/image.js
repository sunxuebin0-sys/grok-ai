const jwt = require('jsonwebtoken');
const fs = require('fs');

const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb';
const GROK_API_KEY = 'xai-FtmlMPaK9PeQIL1ZYUMddBdUY70dlNCDB8kpb6ffpFUMDZYtIWo1Aa56idMSicagImdQV917i44T5yz0';
const GROK_API_BASE = 'https://api.x.ai/v1';
const GROK_IMAGE_MODEL = 'aurora';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: '未登录' });
  }

  const { prompt, size = '1024x1024', n = 1 } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: '描述不能为空' });
  }

  try {
    const response = await fetch(`${GROK_API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROK_IMAGE_MODEL,
        prompt,
        n: Math.min(Number(n), 4),
        size,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `API 错误: ${err}` });
    }

    const data = await response.json();

    // Update image count
    if (user.id !== 'admin') {
      const users = readUsers();
      const u = users.find(x => x.id === user.id);
      if (u) {
        u.imageCount = (u.imageCount || 0) + 1;
        writeUsers(users);
      }
    }

    res.json({ images: data.data.map(d => d.url) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
};
