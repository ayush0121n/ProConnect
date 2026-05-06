import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { FiBriefcase, FiHome, FiMessageSquare, FiBell, FiUsers, FiSearch, FiLogOut, FiUser, FiSettings, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'

const NAV_ITEMS = [
  { path: '/feed',          icon: FiHome,         label: 'Home' },
  { path: '/network',       icon: FiUsers,        label: 'Network' },
  { path: '/jobs',          icon: FiBriefcase,    label: 'Jobs' },
  { path: '/messages',      icon: FiMessageSquare,label: 'Messages' },
  { path: '/notifications', icon: FiBell,         label: 'Alerts' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef()

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/network?search=${encodeURIComponent(search)}`); setSearch('') }
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/feed" className="navbar-logo">Pro<span>Connect</span></Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="navbar-search-icon" size={14} />
          <input
            id="navbar-search-input"
            type="text" placeholder="Search people, jobs..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </form>

        {/* Nav Items */}
        <div className="navbar-nav">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} className={`nav-item ${location.pathname === path ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}

          {/* Profile Menu */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              id="navbar-profile-btn"
              className="nav-item"
              onClick={() => setMenuOpen(v => !v)}
              style={{ flexDirection: 'row', gap: '0.375rem' }}
            >
              <Avatar user={user} size="sm" />
              <FiChevronDown size={14} />
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', minWidth: 200, padding: '0.5rem', zIndex: 200, boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.firstName} {user?.lastName}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{user?.headline || user?.email}</p>
                </div>
                <MenuItem icon={FiUser} label="My Profile" onClick={() => { navigate(`/profile/${user?._id}`); setMenuOpen(false) }} />
                <MenuItem icon={FiSettings} label="Settings" onClick={() => setMenuOpen(false)} />
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <MenuItem icon={FiLogOut} label="Sign Out" onClick={handleLogout} danger />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: danger ? '#ef4444' : 'var(--text-primary)', transition: 'var(--transition)', cursor: 'pointer', border: 'none', background: 'none' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <Icon size={16} />
      {label}
    </button>
  )
}
