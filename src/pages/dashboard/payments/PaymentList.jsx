import { useEffect, useState } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { apiRequest } from '../../../lib/api'

export default function PaymentList() {
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ amount: '', method: '', date: '' })
  const { user } = useAuth()

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await apiRequest('/api/payments')
        setPayments(data)
      } catch (err) {
        setError(err.message)
      }
    }
    loadPayments()
  }, [])

  function startEdit(payment) {
    setEditingId(payment.id)
    setForm({
      amount: String(payment.amount ?? ''),
      method: payment.method ?? '',
      date: payment.date ?? ''
    })
    setMessage('')
    setError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ amount: '', method: '', date: '' })
  }

  async function saveEdit(paymentId) {
    setMessage('')
    setError('')
    try {
      const updated = await apiRequest(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          amount: Number(form.amount),
          method: form.method,
          date: form.date
        })
      })
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? updated : p)))
      setMessage(`Payment ${paymentId} updated.`)
      cancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h3>Payment History</h3>
      {message ? <p className="text-success">{message}</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Invoice</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            {user?.role === 'admin' ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.invoice}</td>
              <td>
                {editingId === p.id ? (
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                ) : (
                  Number(p.amount || 0).toLocaleString()
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <select
                    className="form-control form-control-sm"
                    value={form.method}
                    onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
                  >
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Mobile Money</option>
                    <option>Card</option>
                  </select>
                ) : (
                  p.method
                )}
              </td>
              <td>
                {editingId === p.id ? (
                  <input
                    className="form-control form-control-sm"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  />
                ) : (
                  p.date
                )}
              </td>
              {user?.role === 'admin' ? (
                <td>
                  {editingId === p.id ? (
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => saveEdit(p.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

