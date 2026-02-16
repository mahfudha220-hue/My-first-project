export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('auth_token')
  const useAuth = options.auth !== false

  let response
  try {
    response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...(useAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      ...options,
    })
  } catch {
    throw new Error('Cannot reach backend. Ensure API is running on http://localhost:4000')
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.dispatchEvent(new Event('auth:logout'))
    }
    let message = `Request failed: ${response.status}`
    try {
      const body = await response.json()
      if (body?.message) {
        message = body.message
      }
    } catch {
      // Ignore JSON parse errors for non-JSON responses.
    }
    throw new Error(message)
  }

  return response.json()
}
