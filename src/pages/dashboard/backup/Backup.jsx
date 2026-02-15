import { useEffect, useState } from 'react'
import { apiRequest } from '../../../lib/api'

export default function Backup() {
  const [backup, setBackup] = useState({ lastBackup: null, lastRestore: null })
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadBackup() {
      try {
        const data = await apiRequest('/api/backup')
        setBackup(data)
      } catch (err) {
        setError(err.message)
      }
    }
    loadBackup()
  }, [])

  async function runBackup() {
    setError('')
    try {
      const data = await apiRequest('/api/backup/run', { method: 'POST' })
      setBackup(data)
    } catch (err) {
      setError(err.message)
    }
  }

  async function runRestore() {
    setError('')
    try {
      const data = await apiRequest('/api/backup/restore', { method: 'POST' })
      setBackup(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const lastBackup = backup.lastBackup ? new Date(backup.lastBackup).toLocaleString() : 'Never'
  const lastRestore = backup.lastRestore ? new Date(backup.lastRestore).toLocaleString() : 'Never'

  return (
    <div>
      <h3>System Backup</h3>
      {error ? <p className="text-danger">{error}</p> : null}

      <div className="card p-3">
        <p>Last Backup: {lastBackup}</p>
        <p>Last Restore: {lastRestore}</p>
        <button className="btn btn-primary me-2" type="button" onClick={runBackup}>
          Backup Now
        </button>
        <button className="btn btn-danger" type="button" onClick={runRestore}>
          Restore
        </button>
      </div>
    </div>
  )
}
