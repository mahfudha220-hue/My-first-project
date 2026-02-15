import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function RoleRoute({ roles, children }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login/admin" replace />
  }
  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return children
}
