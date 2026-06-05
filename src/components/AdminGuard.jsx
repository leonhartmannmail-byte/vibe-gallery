import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function AdminGuard({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: '#a1a1aa', fontSize: '14px' }}>加载中...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminGuard
