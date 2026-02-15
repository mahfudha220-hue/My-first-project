import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export default function Sidebar() {
  const { user } = useAuth()
  const role = user?.role || ''

  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: 250 }}>
      <h4>PaySystem</h4>
      <hr />

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link text-white" to="/">Dashboard</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white" to="/invoices">Invoices</Link>
        </li>
        {(role === 'admin' || role === 'manager') && (
          <li className="nav-item">
            <Link className="nav-link text-white" to="/create-invoice">Create Invoice</Link>
          </li>
        )}

        {(role === 'admin' || role === 'cashier') && (
          <li className="nav-item">
            <Link className="nav-link text-white" to="/make-payment">Make Payment</Link>
          </li>
        )}

        <li className="nav-item">
          <Link className="nav-link text-white" to="/payments">Payment History</Link>
        </li>

        {role === 'admin' && (
          <li className="nav-item">
            <Link className="nav-link text-white" to="/users">Users</Link>
          </li>
        )}

        {role === 'admin' && (
          <li className="nav-item">
            <Link className="nav-link text-white" to="/backup">Backup</Link>
          </li>
        )}
      </ul>
    </div>
  )
}

