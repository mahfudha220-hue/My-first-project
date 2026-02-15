import { useEffect, useState } from 'react'
import { apiRequest } from '../../../lib/api'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await apiRequest('/api/users')
        setUsers(data)
      } catch (err) {
        setError(err.message)
      }
    }
    loadUsers()
  }, [])

  return (
    <div>
      <h3>User Management</h3>
      {error ? <p className="text-danger">{error}</p> : null}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td className="text-capitalize">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
