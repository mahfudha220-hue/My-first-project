import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api'

export default function CashierRegister() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await apiRequest('/api/auth/register-cashier', {
        method: 'POST',
        body: JSON.stringify({ name, username, password }),
        auth: false
      })
      navigate('/login/cashier', { replace: true })
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
              <h3 className="mb-3">Cashier Register</h3>
              <p className="text-muted mb-3">Create cashier account before login.</p>
              {error ? <p className="text-danger">{error}</p> : null}
              <form onSubmit={handleSubmit}>
                <input
                  className="form-control mb-2"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="form-control mb-2"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button className="btn btn-success w-100" type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Register'}
                </button>
              </form>
              <hr />
              <Link to="/login/cashier">Back to Cashier Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
