
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'

const API_URL = 'https://levelup-backend-xz8s.onrender.com'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('levelupToken')

    if (!token) {
      setCheckingSession(false)
      return
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Session expired')
        }

        setUser(data.user)
        setPage('dashboard')
      })
      .catch(() => {
        localStorage.removeItem('levelupToken')
        localStorage.removeItem('levelupUser')
        setUser(null)
        setPage('login')
      })
      .finally(() => {
        setCheckingSession(false)
      })
  }, [])

  function handleAuthenticated(data) {
    localStorage.setItem('levelupToken', data.token)
    localStorage.setItem('levelupUser', JSON.stringify(data.user))

    setUser(data.user)
    setPage('dashboard')
  }

  function handleNavigate(nextPage) {
    if (nextPage === 'logout' || nextPage === 'login') {
      localStorage.removeItem('levelupToken')
      localStorage.removeItem('levelupUser')
      setUser(null)
      setPage('login')
      return
    }

    setPage(nextPage)
  }

  if (checkingSession) {
    return (
      <div className="levelup-loading">
        <div className="loading-mark">L</div>
        <p>Preparing your learning space...</p>
      </div>
    )
  }

  if (page === 'login' || page === 'signup') {
    return (
      <Auth
        mode={page}
        onNavigate={setPage}
        onAuthenticated={handleAuthenticated}
      />
    )
  }

  return (
    <Dashboard
      key={user.id}
      onNavigate={handleNavigate}
      user={user}
    />
  )
}

export default App
