import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { userService, connectionService, postService } from '../../services/services'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'
import { FiMapPin, FiGlobe, FiGithub, FiTwitter, FiLinkedin, FiBriefcase, FiBook, FiAward, FiPlus } from 'react-icons/fi'
import { formatDistanceToNow, format } from 'date-fns'

export default function ProfilePage() {
  const { id } = useParams()
  const { user: me } = useAuth()
  const qc = useQueryClient()
  const isOwn = id === me?._id

  const { data: userData, isLoading } = useQuery({ queryKey: ['user', id], queryFn: () => userService.getUserById(id) })
  const { data: postsData } = useQuery({ queryKey: ['userPosts', id], queryFn: () => userService.getUserPosts(id) })
  const user = userData?.data
  const posts = postsData?.data || []

  const sendRequest = async () => {
    try { await connectionService.sendRequest(id); toast.success('Connection request sent!'); qc.invalidateQueries(['user', id]) }
    catch (err) { toast.error(err.message) }
  }

  if (isLoading) return (
    <div style={{ maxWidth: 720, margin: '5rem auto', padding: '0 1rem' }}>
      <div className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />
    </div>
  )
  if (!user) return <div className="empty-state" style={{ marginTop: '8rem' }}><h3>User not found</h3></div>

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '5rem 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="profile-cover" />
        <div style={{ position: 'relative', padding: '0 1.5rem 1.5rem' }}>
          <div style={{ position: 'absolute', top: -55, left: '1.5rem', border: '4px solid var(--bg-card)', borderRadius: '50%' }}>
            <Avatar user={user} size="2xl" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', gap: '0.5rem' }}>
            {!isOwn && (
              <>
                <button className="btn btn-primary btn-sm" onClick={sendRequest}><FiPlus size={14} /> Connect</button>
                <Link to={`/messages`} className="btn btn-outline btn-sm">Message</Link>
              </>
            )}
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
            {user.headline && <p className="profile-headline">{user.headline}</p>}
            <div className="profile-meta">
              {user.location?.city && <span><FiMapPin size={13} />{user.location.city}{user.location.country ? `, ${user.location.country}` : ''}</span>}
              {user.company && <span><FiBriefcase size={13} />{user.company}</span>}
              {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-500)', display: 'flex', alignItems: 'center', gap: 4 }}><FiGlobe size={13} />Website</a>}
            </div>
            {/* Social Links */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {user.socialLinks?.github && <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon"><FiGithub size={16} /></a>}
              {user.socialLinks?.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon"><FiLinkedin size={16} /></a>}
              {user.socialLinks?.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon"><FiTwitter size={16} /></a>}
            </div>
            <div className="profile-stats">
              <div className="profile-stat"><span className="profile-stat-value">{user.connectionsCount}</span><span className="profile-stat-label">Connections</span></div>
              <div className="profile-stat"><span className="profile-stat-value">{user.followersCount}</span><span className="profile-stat-label">Followers</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      {user.bio && (
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>About</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{user.bio}</p>
        </div>
      )}

      {/* Experience */}
      {user.experience?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiBriefcase size={18} /> Experience</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {user.experience.map(exp => (
              <div key={exp._id} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiBriefcase size={18} color="var(--brand-500)" /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{exp.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{exp.company}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{format(new Date(exp.startDate), 'MMM yyyy')} – {exp.isCurrent ? 'Present' : exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : ''}</p>
                  {exp.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {user.education?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiBook size={18} /> Education</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {user.education.map(edu => (
              <div key={edu._id} style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiBook size={18} color="var(--accent)" /></div>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{edu.school}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ''}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{format(new Date(edu.startDate), 'yyyy')} – {edu.endDate ? format(new Date(edu.endDate), 'yyyy') : 'Present'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {user.skills?.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {user.skills.map(skill => (
              <div key={skill._id} style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                {skill.name} {skill.endorsements?.length > 0 && <span style={{ color: 'var(--brand-500)', fontWeight: 700, marginLeft: 4 }}>+{skill.endorsements.length}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Posts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {posts.slice(0, 3).map(post => (
              <div key={post._id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{post.content.slice(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
