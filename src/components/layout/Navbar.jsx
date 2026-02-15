import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login/admin', { replace: true })
  }

  return (
    <nav className="navbar navbar-light bg-light px-4 border-bottom">
      <span className="navbar-brand mb-0 h1">Payment Management System</span>
      <div className="d-flex align-items-center gap-2">
        {user?.username ? (
          <span className="badge bg-info text-uppercase">{user.username}</span>
        ) : null}
        <span className="badge bg-primary text-uppercase">{user?.role || 'guest'}</span>
        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
