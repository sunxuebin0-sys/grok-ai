import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    const t = localStorage.getItem('theme') || 'dark'
    setTheme(t)
    document.documentElement.setAttribute('data-theme', t)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="header">
      <div className="header-logo">
        <a href="/">🤖 Grok AI</a>
      </div>
      <nav className="header-nav">
        <Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>💬 聊天</Link>
        <Link to="/image" className={location.pathname === '/image' ? 'active' : ''}>🎨 生图</Link>
        {user?.isAdmin && <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>⚙️ 管理</Link>}
      </nav>
      <div className="header-actions">
        <button className="btn-ghost" onClick={toggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
        <span className="user-name">👤 {user?.username}</span>
        <button className="btn-ghost" onClick={logout}>退出</button>
      </div>
    </div>
  )
}