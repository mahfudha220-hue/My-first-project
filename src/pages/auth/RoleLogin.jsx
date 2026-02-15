import { useState } from 'react'
import { Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function RoleLogin({ role, title }) {
  const { login, isAuthenticated } = useAuth()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password, role)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="mb-3">{title}</h3>
              <p className="text-muted mb-3">Login to continue.</p>
              {error ? <p className="text-danger">{error}</p> : null}
              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-2"
                  placeholder={`${title} username`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : `Login as ${title}`}
                </button>
              </form>

              <hr />
              <div className="d-flex flex-column gap-1">
                <Link to="/login/admin">Admin Login</Link>
                <Link to="/login/manager">Manager Login</Link>
                <Link to="/login/cashier">Cashier Login</Link>
                {role === 'cashier' ? <Link to="/register/cashier">Cashier Register</Link> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
