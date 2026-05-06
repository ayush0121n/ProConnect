import { useQuery, useQueryClient } from '@tanstack/react-query'
import { connectionService } from '../../services/services'
import Avatar from '../../components/common/Avatar'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUserPlus, FiUserCheck, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export default function NetworkPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: reqData } = useQuery({ queryKey: ['connectionRequests'], queryFn: connectionService.getRequests })
  const { data: sugData } = useQuery({ queryKey: ['suggestions'], queryFn: connectionService.getSuggestions })
  const { data: connData } = useQuery({ queryKey: ['connections'], queryFn: connectionService.getConnections })

  const requests    = reqData?.data || []
  const suggestions = sugData?.data || []
  const connections = connData?.data || []

  const refresh = () => { qc.invalidateQueries(['connectionRequests']); qc.invalidateQueries(['connections']); qc.invalidateQueries(['suggestions']) }

  const accept = async (id) => { try { await connectionService.acceptRequest(id); toast.success('Connection accepted!'); refresh() } catch (e) { toast.error(e.message) } }
  const reject = async (id) => { try { await connectionService.rejectRequest(id); toast.success('Request rejected'); refresh() } catch (e) { toast.error(e.message) } }
  const connect = async (id) => { try { await connectionService.sendRequest(id); toast.success('Request sent!'); refresh() } catch (e) { toast.error(e.message) } }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '5rem 1rem 2rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>My Network</h1>

      {/* Connection Requests */}
      {requests.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUserPlus size={18} color="var(--brand-500)" /> Pending Requests <span className="badge badge-blue">{requests.length}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {requests.map(req => (
              <div key={req._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <Link to={`/profile/${req.requester._id}`}><Avatar user={req.requester} size="lg" /></Link>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700 }}>{req.requester.firstName} {req.requester.lastName}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.requester.headline}</p>
                  {req.message && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>"{req.message}"</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button id={`accept-req-${req._id}`} className="btn btn-primary btn-sm" onClick={() => accept(req._id)}>Accept</button>
                  <button id={`reject-req-${req._id}`} className="btn btn-ghost btn-sm" onClick={() => reject(req._id)}>Ignore</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People You May Know */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>People You May Know</h3>
        {suggestions.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🤝</div><p>No suggestions right now</p></div>
        ) : (
          <div className="network-grid">
            {suggestions.map(sug => (
              <div key={sug._id} className="card connection-card">
                <Link to={`/profile/${sug._id}`}><Avatar user={sug} size="xl" /></Link>
                <p className="connection-card-name">{sug.firstName} {sug.lastName}</p>
                <p className="connection-card-headline">{sug.headline || sug.company || 'ProConnect member'}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sug.connectionsCount} connections</p>
                <button id={`connect-${sug._id}`} className="btn btn-outline btn-sm" style={{ marginTop: '0.25rem', gap: '0.375rem' }} onClick={() => connect(sug._id)}>
                  <FiUserPlus size={14} /> Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Connections */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUsers size={18} color="var(--accent)" /> Connections <span className="badge badge-green">{connections.length}</span>
        </h3>
        {connections.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No connections yet</h3><p>Start connecting with professionals!</p></div>
        ) : (
          <div className="network-grid">
            {connections.map(conn => (
              <div key={conn._id} className="card connection-card">
                <Link to={`/profile/${conn._id}`}><Avatar user={conn} size="xl" /></Link>
                <p className="connection-card-name">{conn.firstName} {conn.lastName}</p>
                <p className="connection-card-headline">{conn.headline || conn.company}</p>
                <Link to={`/messages`} className="btn btn-ghost btn-sm">Message</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
