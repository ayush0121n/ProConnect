import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate('/feed')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card-glass">
        <div className="auth-logo" style={{ padding: '2rem 2rem 0' }}>
          <h1 className="gradient-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800 }}>ProConnect</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Sign in to your professional network</p>
        </div>
        <form className="auth-form" onSubmit={submit} style={{ padding: '1.5rem 2rem 2rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
              <input id="login-email" name="email" type="email" required value={form.email} onChange={handle}
                className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@example.com" autoComplete="email" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
              <input id="login-password" name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={handle}
                className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="Your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.875rem', color: 'var(--brand-500)' }}>Forgot password?</Link>
          </div>
          <button id="login-submit-btn" type="submit" disabled={loading} className="btn btn-primary btn-lg w-full" style={{ marginTop: '0.5rem' }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Signing in...</> : 'Sign In'}
          </button>
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
