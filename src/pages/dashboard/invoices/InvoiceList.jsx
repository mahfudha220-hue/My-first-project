import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { apiRequest } from '../../../lib/api'
import { useAuth } from '../../../auth/AuthContext'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { user } = useAuth()

  function downloadInvoicePdf(invoice) {
    const doc = new jsPDF()
    const amount = Number(invoice.amount || 0).toLocaleString()
    const issuedDate = new Date().toLocaleDateString()

    doc.setFontSize(18)
    doc.text('Invoice', 20, 20)

    doc.setFontSize(12)
    doc.text(`Invoice ID: ${invoice.id}`, 20, 35)
    doc.text(`Customer: ${invoice.customer}`, 20, 45)
    doc.text(`Amount: TZS ${amount}`, 20, 55)
    doc.text(`Status: ${invoice.status}`, 20, 65)
    doc.text(`Due Date: ${invoice.dueDate || '-'}`, 20, 75)
    doc.text(`Issued Date: ${issuedDate}`, 20, 85)

    doc.save(`invoice-${invoice.id}.pdf`)
  }

  useEffect(() => {
    async function loadInvoices() {
      try {
        const data = await apiRequest('/api/invoices')
        setInvoices(data)
      } catch (err) {
        setError(err.message)
      }
    }
    loadInvoices()
  }, [])

  async function handleDelete(invoiceId) {
    const confirmed = window.confirm(`Delete invoice ${invoiceId}? This cannot be undone.`)
    if (!confirmed) return
    setError('')
    setMessage('')
    try {
      await apiRequest(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId))
      setMessage(`Invoice ${invoiceId} deleted.`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h3>Invoice List</h3>
      {message ? <p className="text-success">{message}</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            {user?.role === 'admin' ? <th>Actions</th> : null}
            {user?.role === 'cashier' ? <th>PDF</th> : null}
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.customer}</td>
              <td>{Number(inv.amount || 0).toLocaleString()}</td>
              <td>{inv.status}</td>
              <td>{inv.dueDate || '-'}</td>
              {user?.role === 'admin' ? (
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(inv.id)}
                  >
                    Delete
                  </button>
                </td>
              ) : null}
              {user?.role === 'cashier' ? (
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => downloadInvoicePdf(inv)}
                  >
                    Download PDF
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
