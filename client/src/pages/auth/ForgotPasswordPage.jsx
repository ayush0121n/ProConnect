import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/services'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft } from 'react-icons/fi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card-glass" style={{ padding: '2.5rem' }}>
        <h1 className="gradient-text" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Reset Password</h1>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <p style={{ color: 'var(--text-secondary)' }}>Check your email for a reset link. It expires in 10 minutes.</p>
            <Link to="/login" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Enter your email and we'll send you a reset link.</p>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@example.com" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link to="/login" className="btn btn-ghost" style={{ gap: '0.5rem' }}><FiArrowLeft size={16} /> Back to Sign In</Link>
          </form>
        )}
      </div>
    </div>
  )
}
