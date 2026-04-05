import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'

export default function Admin() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const usersData = await usersRes.json()
      const statsData = await statsRes.json()
      setUsers(usersData.users || [])
      setStats(statsData)
    } catch {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function toggleBan(id) {
    try {
      const res = await fetch(`/api/admin/ban?id=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setUsers(prev =>
          prev.map(u => (u.id === id ? { ...u, isBanned: data.isBanned } : u))
        )
      }
    } catch {}
  }

  async function deleteUser(id, username) {
    if (!confirm(`确定删除用户 "${username}" 吗？此操作不可撤销！`)) return
    try {
      const res = await fetch(`/api/admin/ban?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id))
        setStats(prev => prev ? { ...prev, totalUsers: prev.totalUsers - 1 } : prev)
      }
    } catch {}
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleString('zh-CN')
  }

  return (
    <div className="page-layout">
      <Header />
      <div className="admin-container">
        <h2 className="admin-title">🛠 管理后台</h2>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">总用户数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-value">{stats.totalChats}</div>
              <div className="stat-label">总聊天次数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎨</div>
              <div className="stat-value">{stats.totalImages}</div>
              <div className="stat-label">总生图次数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚫</div>
              <div className="stat-value">{stats.bannedUsers}</div>
              <div className="stat-label">封禁用户</div>
            </div>
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <div className="table-card">
          <div className="table-header">
            <h3>用户列表</h3>
            <button className="btn-refresh" onClick={loadData}>🔄 刷新</button>
          </div>
          {loading ? (
            <div className="table-loading">加载中...</div>
          ) : (
            <div className="table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>用户名</th>
                    <th>注册时间</th>
                    <th>最后登录</th>
                    <th>聊天次数</th>
                    <th>生图次数</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        {u.username}
                        {u.isAdmin && <span className="badge-admin">管理员</span>}
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>{formatDate(u.lastLogin)}</td>
                      <td>{u.chatCount}</td>
                      <td>{u.imageCount}</td>
                      <td>
                        <span className={`badge ${u.isBanned ? 'badge-banned' : 'badge-active'}`}>
                          {u.isBanned ? '已封禁' : '正常'}
                        </span>
                      </td>
                      <td>
                        {!u.isAdmin && (
                          <div className="action-btns">
                            <button
                              className={`btn-action ${u.isBanned ? 'btn-unban' : 'btn-ban'}`}
                              onClick={() => toggleBan(u.id)}
                            >
                              {u.isBanned ? '解封' : '封禁'}
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => deleteUser(u.id, u.username)}
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="table-empty">暂无用户</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
