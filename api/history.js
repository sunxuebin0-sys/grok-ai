const jwt = require('jsonwebtoken');
const fs = require('fs');

const JWT_SECRET = 'grok_ai_jwt_secret_2024_xsb';
const HISTORY_FILE = '/tmp/history.json';

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

function readHistory() {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify({}));
      return {};
    }
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

module.exports = async function handler(req, res) {
  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.method === 'GET') {
    const history = readHistory();
    return res.json({ messages: history[user.id] || [] });
  }

  if (req.method === 'POST') {
    const { messages } = req.body || {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: '格式错误' });
    }
    const history = readHistory();
    history[user.id] = messages;
    writeHistory(history);
    return res.json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const history = readHistory();
    delete history[user.id];
    writeHistory(history);
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
