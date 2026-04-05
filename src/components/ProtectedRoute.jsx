import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token')
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/chat" replace />
  }

  return children
}
