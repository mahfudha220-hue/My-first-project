import { Navigate, Outlet, useLocation } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login/admin" replace state={{ from: location }} />
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
