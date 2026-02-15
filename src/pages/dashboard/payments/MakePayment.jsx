import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { apiRequest } from '../../../lib/api'

export default function MakePayment() {
  const [invoices, setInvoices] = useState([])
  const [invoice, setInvoice] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Cash')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [lastPaidInvoice, setLastPaidInvoice] = useState(null)

  function downloadInvoicePdf(invoiceRow) {
    if (!invoiceRow) return
    const doc = new jsPDF()
    const amountText = Number(invoiceRow.amount || 0).toLocaleString()
    const issuedDate = new Date().toLocaleDateString()

    doc.setFontSize(18)
    doc.text('Invoice', 20, 20)

    doc.setFontSize(12)
    doc.text(`Invoice ID: ${invoiceRow.id}`, 20, 35)
    doc.text(`Customer: ${invoiceRow.customer}`, 20, 45)
    doc.text(`Amount: TZS ${amountText}`, 20, 55)
    doc.text(`Status: ${invoiceRow.status}`, 20, 65)
    doc.text(`Due Date: ${invoiceRow.dueDate || '-'}`, 20, 75)
    doc.text(`Issued Date: ${issuedDate}`, 20, 85)

    doc.save(`invoice-${invoiceRow.id}.pdf`)
  }

  useEffect(() => {
    let active = true
    async function loadInvoices() {
      try {
        const data = await apiRequest('/api/invoices')
        if (!active) return
        setInvoices(data)
        if (!invoice && data.length) {
          const first = data[0]
          setInvoice(first.id)
          setAmount(first.amount ? String(first.amount) : '')
        }
      } catch (err) {
        if (!active) return
        setError(err.message)
      }
    }
    loadInvoices()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const created = await apiRequest('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ invoice, amount: Number(amount), method, date }),
      })
      setMessage(`Payment ${created.id} saved successfully.`)
      const refreshed = await apiRequest('/api/invoices')
      setInvoices(refreshed)
      const matched = refreshed.find((item) => item.id === invoice) || null
      setLastPaidInvoice(matched)
      setInvoice('')
      setAmount('')
      setMethod('Cash')
      setDate('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h3>Make Payment</h3>
      {message ? (
        <div className="alert alert-success" role="alert">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span>{message}</span>
            {lastPaidInvoice ? (
              <span className="badge bg-light text-dark">
                Invoice: {lastPaidInvoice.id}
              </span>
            ) : null}
          </div>
          {lastPaidInvoice ? (
            <div className="card mt-3">
              <div className="card-body">
                <h6 className="card-title mb-3">Invoice Details</h6>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <strong>ID:</strong> {lastPaidInvoice.id}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Customer:</strong> {lastPaidInvoice.customer}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Amount:</strong>{' '}
                    {Number(lastPaidInvoice.amount || 0).toLocaleString()} TZS
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Status:</strong> {lastPaidInvoice.status}
                  </div>
                  <div className="col-md-6 mb-2">
                    <strong>Due Date:</strong> {lastPaidInvoice.dueDate || '-'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => downloadInvoicePdf(lastPaidInvoice)}
                >
                  Download Invoice
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <form className="card p-3" onSubmit={handleSubmit}>
        <select
          className="form-control mb-2"
          value={invoice}
          onChange={(e) => {
            const value = e.target.value
            setInvoice(value)
            const selected = invoices.find((item) => item.id === value)
            if (selected) {
              setAmount(selected.amount ? String(selected.amount) : '')
            }
          }}
          required
        >
          <option value="" disabled>
            Select Invoice
          </option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.id}
            </option>
          ))}
        </select>
        <input
          className="form-control mb-2"
          placeholder="Amount"
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="form-control mb-2"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Mobile Money</option>
          <option>Card</option>
        </select>

        <input
          type="date"
          className="form-control mb-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button className="btn btn-success" type="submit">Pay</button>
      </form>
    </div>
  )
}
