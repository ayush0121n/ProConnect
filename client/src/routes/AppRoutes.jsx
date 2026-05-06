import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'

const LoginPage        = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage     = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPassword   = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const FeedPage         = lazy(() => import('../pages/feed/FeedPage'))
const ProfilePage      = lazy(() => import('../pages/profile/ProfilePage'))
const JobsPage         = lazy(() => import('../pages/jobs/JobsPage'))
const MessagesPage     = lazy(() => import('../pages/messages/MessagesPage'))
const NetworkPage      = lazy(() => import('../pages/network/NetworkPage'))
const NotificationsPage= lazy(() => import('../pages/notifications/NotificationsPage'))
const NotFoundPage     = lazy(() => import('../pages/NotFoundPage'))

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading-screen"><div className="loading-logo gradient-text">ProConnect</div></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/feed" replace /> : children
}

const Fallback = () => <div className="loading-screen"><div className="spinner spinner-lg" /></div>

export default function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return (
    <>
      {isAuthenticated && <Navbar />}
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/feed"          element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/profile/:id"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/jobs"          element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/messages"      element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/network"       element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="*"              element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
