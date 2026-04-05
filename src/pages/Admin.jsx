import { useState, useEffect, useCallback } from 'react'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const token = localStorage.getItem('token')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
      ])
      if (!statsRes.ok || !usersRes.ok) throw new Error('加载失败')
      const statsData = await statsRes.json()
      const usersData = await usersRes.json()
      setStats(statsData)
      setUsers(usersData.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const doAction = async (username, action) => {
    const labels = { ban: '封禁', unban: '解封', delete: '删除' }
    if (!window.confirm(`确定要${labels[action]}用户 ${username} 吗？`)) return
    setActionLoading(username + action)
    try {
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username, action })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '操作失败')
      await fetchData()
    } catch (err) {
      alert('操作失败：' + err.message)
    } finally {
      setActionLoading('')
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div className="loading-page">⏳ 加载中...</div>

  return (
    <div className="admin-page">
      <h2>⚙️ 管理后台</h2>

      {error && <div className="error-msg">{error}</div>}

      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-num">{stats.totalUsers}</div>
            <div className="stat-label">👥 总用户数</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats.totalChats}</div>
            <div className="stat-label">💬 总聊天次数</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats.totalImages}</div>
            <div className="stat-label">🎨 总生图次数</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats.bannedUsers}</div>
            <div className="stat-label">🚫 被封禁用户</div>
          </div>
        </div>
      )}

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>👥 用户列表</h3>
          <button className="btn-ghost" onClick={fetchData}>🔄 刷新</button>
        </div>
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>注册时间</th>
                <th>最后登录</th>
                <th>聊天</th>
                <th>生图</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center',color:'var(--text2)',padding:'32px'}}>暂无用户</td></tr>
              )}
              {users.map(u => (
                <tr key={u.username}>
                  <td>
                    {u.username}
                    {u.isAdmin && <span className="badge">管理员</span>}
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>{formatDate(u.lastLogin)}</td>
                  <td>{u.chatCount}</td>
                  <td>{u.imageCount}</td>
                  <td>
                    <span className={`status ${u.banned ? 'banned' : 'active'}`}>
                      {u.banned ? '已封禁' : '正常'}
                    </span>
                  </td>
                  <td>
                    {!u.isAdmin && (
                      <>
                        {u.banned ? (
                          <button
                            className="btn-sm"
                            onClick={() => doAction(u.username, 'unban')}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === u.username + 'unban' ? '...' : '解封'}
                          </button>
                        ) : (
                          <button
                            className="btn-sm"
                            onClick={() => doAction(u.username, 'ban')}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === u.username + 'ban' ? '...' : '封禁'}
                          </button>
                        )}
                        <button
                          className="btn-sm danger"
                          onClick={() => doAction(u.username, 'delete')}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === u.username + 'delete' ? '...' : '删除'}
                        </button>
                      </>
                    )}
                    {u.isAdmin && <span style={{color:'var(--text2)',fontSize:'0.8rem'}}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
