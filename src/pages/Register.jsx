import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('两次密码不一致'); return }
    if (form.password.length < 6) { setError('密码至少6位'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '注册失败')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🤖 Grok AI</h1>
          <p>智能聊天 & AI 生图平台</p>
        </div>
        <h2>注册账号</h2>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input type="text" placeholder="3-20位用户名" value={form.username}
              onChange={e => setForm({...form, username: e.target.value})} required minLength={3} maxLength={20} />
          </div>
          <div className="form-group">
            <label>密码</label>
            <input type="password" placeholder="至少6位" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>确认密码</label>
            <input type="password" placeholder="再次输入密码" value={form.confirm}
              onChange={e => setForm({...form, confirm: e.target.value})} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><span className="loading"></span>注册中...</> : '注册'}
          </button>
        </form>
        <div className="auth-link">已有账号？<Link to="/login">立即登录</Link></div>
      </div>
    </div>
  )
}