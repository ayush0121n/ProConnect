import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '6rem', lineHeight: 1 }}>🔍</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }} className="gradient-text">404</h1>
      <h2 style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/feed" className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }}>Back to Feed</Link>
    </div>
  )
}
