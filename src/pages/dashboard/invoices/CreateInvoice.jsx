import { useState } from 'react'
import { apiRequest } from '../../../lib/api'

export default function CreateInvoice() {
  const [customer, setCustomer] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const created = await apiRequest('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({ customer, amount: Number(amount), dueDate }),
      })
      setMessage(`Invoice ${created.id} created.`)
      setCustomer('')
      setAmount('')
      setDueDate('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h3>Create Invoice</h3>
      {message ? <p className="text-success">{message}</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <form className="card p-3" onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          placeholder="Customer Name"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          required
        />
        <input
          className="form-control mb-2"
          placeholder="Amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="date"
          className="form-control mb-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">Save</button>
      </form>
    </div>
  )
}
