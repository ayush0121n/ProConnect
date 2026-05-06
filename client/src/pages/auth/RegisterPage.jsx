import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { confirmPassword, ...data } = form
      await register(data)
      toast.success('Welcome to ProConnect! Please verify your email.')
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
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Join your professional community</p>
        </div>
        <form className="auth-form" onSubmit={submit} style={{ padding: '1.5rem 2rem 2rem' }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-firstname">First name</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
                <input id="reg-firstname" name="firstName" type="text" required value={form.firstName} onChange={handle}
                  className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="John" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-lastname">Last name</label>
              <input id="reg-lastname" name="lastName" type="text" required value={form.lastName} onChange={handle} className="form-input" placeholder="Doe" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
              <input id="reg-email" name="email" type="email" required value={form.email} onChange={handle}
                className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@example.com" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
              <input id="reg-password" name="password" type={showPass ? 'text' : 'password'} required value={form.password} onChange={handle}
                className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>
                {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
            <input id="reg-confirm" name="confirmPassword" type={showPass ? 'text' : 'password'} required value={form.confirmPassword} onChange={handle} className="form-input" placeholder="Re-enter password" />
          </div>
          <button id="register-submit-btn" type="submit" disabled={loading} className="btn btn-primary btn-lg w-full" style={{ marginTop: '0.5rem' }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</> : 'Create Account'}
          </button>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
