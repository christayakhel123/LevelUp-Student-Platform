
import { useState } from 'react'
import './Auth.css'

const API_URL = 'https://levelup-backend-xz8s.onrender.com'

function Auth({ mode = 'login', onNavigate, onAuthenticated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isSignup = mode === 'signup'

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const cleanName = form.name.trim()
    const cleanEmail = form.email.trim()

    if (isSignup && cleanName.length < 2) {
      setError('Please enter your name (at least 2 characters).')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (form.password.length < 8 || form.password.length > 128) {
      setError('Your password must contain 8 to 128 characters.')
      return
    }

    setLoading(true)

    try {
      const endpoint = isSignup
        ? '/api/auth/register'
        : '/api/auth/login'

      const payload = isSignup
        ? {
            name: cleanName,
            email: cleanEmail,
            password: form.password,
          }
        : {
            email: cleanEmail,
            password: form.password,
          }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.')
      }

      onAuthenticated(data)
    } catch (requestError) {
      if (requestError instanceof TypeError) {
        setError(
          'Cannot connect to LevelUp. Please check that the backend is running.'
        )
      } else {
        setError(requestError.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-showcase-inner">
          <a
            className="auth-brand"
            href="#home"
            onClick={(event) => event.preventDefault()}
          >
            <span className="auth-brand-mark">L</span>
            <span>
              <strong>LevelUp</strong>
              <small>YOUR STUDENT SPACE</small>
            </span>
          </a>

          <div className="auth-hero">
            <span className="auth-eyebrow">
              <span className="auth-eyebrow-dot" />
              YOUR NEXT CHAPTER STARTS HERE
            </span>

            <h1>
              Small steps.
              <br />
              <span>Big progress.</span>
            </h1>

            <p>
              One calm space to organise your studies, build skills,
              track your goals, and become the person you want to be.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>
                  <strong>Find your focus</strong>
                  <small>Keep assignments and priorities organised.</small>
                </span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">↗</span>
                <span>
                  <strong>See your progress</strong>
                  <small>Celebrate the work you put in every day.</small>
                </span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">✳</span>
                <span>
                  <strong>Grow at your pace</strong>
                  <small>Make space for learning beyond the classroom.</small>
                </span>
              </div>
            </div>
          </div>

          <div className="auth-showcase-footer">
            <span>MADE FOR YOUR GROWTH</span>
            <span>LEARN · BUILD · BECOME</span>
          </div>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">L</span>
            <strong>LevelUp</strong>
          </div>

          <div className="auth-form-heading">
            <span className="auth-form-eyebrow">
              {isSignup ? 'A FRESH START' : 'WELCOME BACK'}
            </span>

            <h2>
              {isSignup ? 'Create your space.' : 'Good to see you.'}
            </h2>

            <p>
              {isSignup
                ? 'Set up your account and start building better habits.'
                : 'Sign in and pick up where your progress left off.'}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={!isSignup ? 'auth-tab active' : 'auth-tab'}
              onClick={() => {
                setError('')
                onNavigate('login')
              }}
            >
              Sign in
            </button>

            <button
              type="button"
              className={isSignup ? 'auth-tab active' : 'auth-tab'}
              onClick={() => {
                setError('')
                onNavigate('signup')
              }}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={60}
                  autoComplete="name"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={254}
                required
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="auth-password">Password</label>
                <span>8 characters minimum</span>
              </div>

              <div className="auth-password-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  maxLength={128}
                  autoComplete={
                    isSignup ? 'new-password' : 'current-password'
                  }
                  required
                  disabled={loading}
                />

                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : isSignup
                  ? 'Create my account'
                  : 'Sign in to LevelUp'}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : 'New to LevelUp?'}
            {' '}
            <button
              type="button"
              onClick={() => {
                setError('')
                onNavigate(isSignup ? 'login' : 'signup')
              }}
            >
              {isSignup ? 'Sign in' : 'Create an account'}
            </button>
          </p>

          <div className="auth-security-note">
            <span>⌑</span>
            Your account is protected with password hashing.
          </div>

          <p className="auth-legal">
            YOUR JOURNEY. YOUR PACE. YOUR PROGRESS.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Auth
