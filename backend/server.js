import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import { Pool } from 'pg'

const app = express()
const PORT = process.env.PORT || 4000
const sessions = new Map()
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'payment-management-system',
  user: process.env.PGUSER || 'Mahfudha',
  password: process.env.PGPASSWORD || '123',
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
})

function createToken() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return crypto.randomBytes(16).toString('hex')
}

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json())

const idTableMap = {
  USR: 'users',
  INV: 'invoices',
  PAY: 'payments'
}

async function nextId(prefix) {
  const table = idTableMap[prefix]
  if (!table) {
    throw new Error(`Unknown id prefix: ${prefix}`)
  }
  const { rows } = await pool.query(
    `SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM '[0-9]+$') AS INT)), 0) AS max FROM ${table} WHERE id LIKE $1`,
    [`${prefix}%`]
  )
  const max = Number(rows[0]?.max || 0)
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    username: user.username
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return null
  }
  return token
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req)
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  req.user = sessions.get(token)
  next()
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password, role } = req.body
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' })
    }
    const normalizedUsername = String(username).trim().toLowerCase()
    const normalizedRole = role ? String(role).trim().toLowerCase() : null

    const params = [normalizedUsername, String(password)]
    let sql =
      'SELECT id, name, role, username FROM users WHERE LOWER(username) = $1 AND password = $2'
    if (normalizedRole) {
      sql += ' AND role = $3'
      params.push(normalizedRole)
    }
    sql += ' LIMIT 1'

    const result = await pool.query(sql, params)
    const user = result.rows[0]

    if (!user) {
      if (normalizedRole === 'cashier') {
        let createdUser
        let inserted = false
        for (let attempt = 0; attempt < 3 && !inserted; attempt += 1) {
          createdUser = {
            id: await nextId('USR'),
            name: String(username).trim(),
            role: 'cashier',
            username: String(username).trim(),
            password: String(password)
          }
          try {
            await pool.query(
              'INSERT INTO users (id, name, role, username, password) VALUES ($1, $2, $3, $4, $5)',
              [
                createdUser.id,
                createdUser.name,
                createdUser.role,
                createdUser.username,
                createdUser.password
              ]
            )
            inserted = true
          } catch (err) {
            if (err.code !== '23505' || attempt === 2) {
              throw err
            }
          }
        }
        user = createdUser
      } else {
        return res.status(401).json({ message: 'Invalid credentials' })
      }
    }

    const token = createToken()
    const sessionUser = sanitizeUser(user)
    sessions.set(token, sessionUser)
    res.json({ token, user: sessionUser })
  } catch (err) {
    next(err)
  }
})

app.post('/api/auth/register-cashier', async (req, res, next) => {
  try {
    const { name, username, password } = req.body
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'name, username and password are required' })
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'password must be at least 6 characters' })
    }

    const normalizedUsername = String(username).trim().toLowerCase()
    const exists = await pool.query(
      'SELECT 1 FROM users WHERE LOWER(username) = $1 AND role = $2 LIMIT 1',
      [normalizedUsername, 'cashier']
    )
    if (exists.rows.length) {
      return res.status(409).json({ message: 'username already exists' })
    }

    let user
    let inserted = false
    for (let attempt = 0; attempt < 3 && !inserted; attempt += 1) {
      user = {
        id: await nextId('USR'),
        name: String(name).trim(),
        role: 'cashier',
        username: String(username).trim(),
        password: String(password)
      }

      try {
        await pool.query(
          'INSERT INTO users (id, name, role, username, password) VALUES ($1, $2, $3, $4, $5)',
          [user.id, user.name, user.role, user.username, user.password]
        )
        inserted = true
      } catch (err) {
        if (err.code !== '23505' || attempt === 2) {
          throw err
        }
      }
    }
    res.status(201).json({ user: sanitizeUser(user) })
  } catch (err) {
    next(err)
  }
})

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user)
})

app.post('/api/auth/logout', requireAuth, (req, res) => {
  const token = getBearerToken(req)
  sessions.delete(token)
  res.json({ success: true })
})

app.get('/', (_req, res) => {
  res.json({
    name: 'Payment Management Backend',
    status: 'ok',
    docs: {
      health: '/health',
      summary: '/api/dashboard/summary',
      invoices: '/api/invoices',
      payments: '/api/payments',
      users: '/api/users',
      backup: '/api/backup'
    }
  })
})

app.get('/api/dashboard/summary', requireAuth, async (_req, res, next) => {
  try {
    const invoiceSummary = await pool.query(
      "SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'Paid')::int AS paid FROM invoices"
    )
    const totalInvoices = invoiceSummary.rows[0]?.total || 0
    const paidInvoices = invoiceSummary.rows[0]?.paid || 0
    const pendingInvoices = totalInvoices - paidInvoices

    const revenueResult = await pool.query('SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments')
    const revenue = Number(revenueResult.rows[0]?.revenue || 0)
    res.json({ totalInvoices, paidInvoices, pendingInvoices, revenue })
  } catch (err) {
    next(err)
  }
})

app.get('/api/invoices', requireAuth, async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, customer, amount, status, due_date AS "dueDate", created_at AS "createdAt" FROM invoices ORDER BY id'
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

app.post('/api/invoices', requireAuth, requireRole(['admin', 'manager']), async (req, res, next) => {
  try {
    const { customer, amount, dueDate } = req.body
    if (!customer || !Number.isFinite(Number(amount))) {
      return res.status(400).json({ message: 'customer and numeric amount are required' })
    }

    const invoice = {
      id: await nextId('INV'),
      customer: String(customer).trim(),
      amount: Number(amount),
      status: 'Unpaid',
      dueDate: dueDate || null,
      createdAt: new Date().toISOString()
    }
    await pool.query(
      'INSERT INTO invoices (id, customer, amount, status, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        invoice.id,
        invoice.customer,
        invoice.amount,
        invoice.status,
        invoice.dueDate,
        invoice.createdAt
      ]
    )
    res.status(201).json(invoice)
  } catch (err) {
    next(err)
  }
})

app.patch('/api/invoices/:id', requireAuth, requireRole(['admin', 'manager']), async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const result = await pool.query(
      'SELECT id, customer, amount, status, due_date AS "dueDate", created_at AS "createdAt" FROM invoices WHERE id = $1',
      [id]
    )
    const invoice = result.rows[0]
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    if (status) {
      invoice.status = status
      await pool.query('UPDATE invoices SET status = $2 WHERE id = $1', [id, status])
    }
    res.json(invoice)
  } catch (err) {
    next(err)
  }
})

app.delete('/api/invoices/:id', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id])
    if (!result.rows.length) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

app.get('/api/payments', requireAuth, async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, invoice, amount, method, date, created_at AS "createdAt" FROM payments ORDER BY id'
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

app.post('/api/payments', requireAuth, requireRole(['admin', 'cashier']), async (req, res, next) => {
  try {
    const { invoice, amount, method, date } = req.body
    if (!invoice || !Number.isFinite(Number(amount)) || !method) {
      return res.status(400).json({ message: 'invoice, amount and method are required' })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const invoiceResult = await client.query(
        'SELECT id, amount FROM invoices WHERE id = $1 FOR UPDATE',
        [invoice]
      )
      const invoiceRow = invoiceResult.rows[0]
      if (!invoiceRow) {
        await client.query('ROLLBACK')
        return res.status(404).json({ message: 'Invoice not found' })
      }

      const payment = {
        id: await nextId('PAY'),
        invoice,
        amount: Number(amount),
        method: String(method),
        date: date || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      }

      await client.query(
        'INSERT INTO payments (id, invoice, amount, method, date, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          payment.id,
          payment.invoice,
          payment.amount,
          payment.method,
          payment.date,
          payment.createdAt
        ]
      )

      const paidResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE invoice = $1',
        [invoice]
      )
      const paidAmount = Number(paidResult.rows[0]?.total || 0)
      const newStatus = paidAmount >= Number(invoiceRow.amount || 0) ? 'Paid' : 'Unpaid'
      await client.query('UPDATE invoices SET status = $2 WHERE id = $1', [invoice, newStatus])

      await client.query('COMMIT')
      res.status(201).json(payment)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    next(err)
  }
})

app.patch('/api/payments/:id', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params
    const { amount, method, date } = req.body
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const paymentResult = await client.query(
        'SELECT id, invoice, amount, method, date, created_at AS "createdAt" FROM payments WHERE id = $1 FOR UPDATE',
        [id]
      )
      const payment = paymentResult.rows[0]
      if (!payment) {
        await client.query('ROLLBACK')
        return res.status(404).json({ message: 'Payment not found' })
      }

      const newAmount =
        amount !== undefined && Number.isFinite(Number(amount)) ? Number(amount) : payment.amount
      const newMethod = method ? String(method) : payment.method
      const newDate = date ? String(date) : payment.date

      const updateResult = await client.query(
        'UPDATE payments SET amount = $2, method = $3, date = $4 WHERE id = $1 RETURNING id, invoice, amount, method, date, created_at AS "createdAt"',
        [id, newAmount, newMethod, newDate]
      )
      const updated = updateResult.rows[0]

      const invoiceResult = await client.query(
        'SELECT amount FROM invoices WHERE id = $1 FOR UPDATE',
        [updated.invoice]
      )
      const invoiceAmount = Number(invoiceResult.rows[0]?.amount || 0)
      const paidResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE invoice = $1',
        [updated.invoice]
      )
      const paidAmount = Number(paidResult.rows[0]?.total || 0)
      const newStatus = paidAmount >= invoiceAmount ? 'Paid' : 'Unpaid'
      await client.query('UPDATE invoices SET status = $2 WHERE id = $1', [
        updated.invoice,
        newStatus
      ])

      await client.query('COMMIT')
      res.json(updated)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    next(err)
  }
})

app.get('/api/users', requireAuth, requireRole(['admin']), async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, role, username FROM users ORDER BY id')
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
})

app.get('/api/backup', requireAuth, requireRole(['admin']), async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT last_backup AS "lastBackup", last_restore AS "lastRestore" FROM backup WHERE id = 1'
    )
    if (!result.rows.length) {
      return res.json({ lastBackup: null, lastRestore: null })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

app.post('/api/backup/run', requireAuth, requireRole(['admin']), async (_req, res, next) => {
  try {
    const result = await pool.query(
      'INSERT INTO backup (id, last_backup) VALUES (1, NOW()) ON CONFLICT (id) DO UPDATE SET last_backup = NOW() RETURNING last_backup AS "lastBackup", last_restore AS "lastRestore"'
    )
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

app.post('/api/backup/restore', requireAuth, requireRole(['admin']), async (_req, res, next) => {
  try {
    const result = await pool.query(
      'INSERT INTO backup (id, last_restore) VALUES (1, NOW()) ON CONFLICT (id) DO UPDATE SET last_restore = NOW() RETURNING last_backup AS "lastBackup", last_restore AS "lastRestore"'
    )
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
})

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' })
  }
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`)
})



