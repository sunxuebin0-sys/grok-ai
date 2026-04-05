import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">⚡ Grok AI</span>
        <nav className="nav">
          <Link to="/chat" className={location.pathname === '/chat' ? 'nav-link active' : 'nav-link'}>
            💬 聊天
          </Link>
          <Link to="/image" className={location.pathname === '/image' ? 'nav-link active' : 'nav-link'}>
            🎨 生图
          </Link>
          {user?.isAdmin && (
            <Link to="/admin" className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}>
              🛠 管理
            </Link>
          )}
        </nav>
      </div>
      <div className="header-right">
        <span className="username">👤 {user?.username}</span>
        <button className="btn-logout" onClick={logout}>退出</button>
      </div>
    </header>
  )
}
