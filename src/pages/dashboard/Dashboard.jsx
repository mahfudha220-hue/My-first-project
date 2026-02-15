import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { apiRequest } from '../../lib/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    revenue: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await apiRequest('/api/dashboard/summary')
        setSummary(data)
      } catch (err) {
        setError(err.message)
      }
    }
    loadSummary()
  }, [])

  return (
    <div>
      <h3>Dashboard</h3>
      {error ? <p className="text-danger">{error}</p> : null}

      <div className="row">
        <div className="col-md-3">
          <div className="card p-3">Total Invoices: {summary.totalInvoices}</div>
        </div>
        <div className="col-md-3">
          <div className="card p-3">Paid: {summary.paidInvoices}</div>
        </div>
        <div className="col-md-3">
          <div className="card p-3">Pending: {summary.pendingInvoices}</div>
        </div>
        <div className="col-md-3">
          <div className="card p-3">Revenue: {summary.revenue.toLocaleString()} TZS</div>
        </div>
      </div>
    </div>
  )
}
