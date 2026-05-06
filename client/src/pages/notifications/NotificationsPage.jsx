import { useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationService } from '../../services/services'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { FiBell, FiCheck } from 'react-icons/fi'

const TYPE_ICONS = {
  connection_request: '🤝', connection_accepted: '✅', post_like: '❤️',
  post_comment: '💬', post_share: '🔁', job_application: '💼',
  message: '✉️', group_invite: '👥', skill_endorsement: '⭐', profile_view: '👁️'
}

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationService.getAll({ limit: 50 }) })
  const notifications = data?.data || []

  const markAll = async () => {
    try { await notificationService.markAllRead(); qc.invalidateQueries(['notifications']); toast.success('All marked as read') }
    catch (e) { toast.error(e.message) }
  }

  const markOne = async (id) => {
    await notificationService.markRead(id)
    qc.invalidateQueries(['notifications'])
  }

  if (isLoading) return (
    <div style={{ maxWidth: 700, margin: '5rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array(5).fill(0).map((_, i) => <div key={i} className="card skeleton" style={{ height: 72 }} />)}
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '5rem 1rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <FiBell /> Notifications
        </h1>
        {notifications.some(n => !n.isRead) && (
          <button id="mark-all-read-btn" className="btn btn-ghost btn-sm" onClick={markAll} style={{ gap: '0.375rem' }}>
            <FiCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">🔔</div>
          <h3>No notifications</h3>
          <p style={{ fontSize: '0.875rem' }}>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notifications.map(notif => (
            <div key={notif._id}
              onClick={() => !notif.isRead && markOne(notif._id)}
              style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: notif.isRead ? 'var(--bg-card)' : 'rgba(10,102,194,0.1)', border: `1px solid ${notif.isRead ? 'var(--border)' : 'rgba(10,102,194,0.2)'}`, cursor: notif.isRead ? 'default' : 'pointer', transition: 'var(--transition)', alignItems: 'flex-start' }}
            >
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{TYPE_ICONS[notif.type] || '🔔'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{notif.content}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!notif.isRead && <div className="online-dot" style={{ flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
