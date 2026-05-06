import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postService } from '../../services/services'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/common/Avatar'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FiHeart, FiMessageSquare, FiShare2, FiSend, FiImage, FiTrash2, FiMoreHorizontal } from 'react-icons/fi'

function CreatePost({ onCreated }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await postService.createPost({ content })
      setContent('')
      toast.success('Post shared!')
      onCreated?.()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="card fade-in">
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <Avatar user={user} size="md" />
          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            className="form-input" placeholder="Share something with your network..."
            style={{ flex: 1, minHeight: 80, resize: 'none', borderRadius: 'var(--radius-md)' }}
            id="create-post-textarea"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost btn-sm" style={{ gap: '0.375rem', color: 'var(--text-secondary)' }}><FiImage size={16} /> Photo</button>
          </div>
          <button id="post-submit-btn" type="submit" disabled={loading || !content.trim()} className="btn btn-primary btn-sm" style={{ gap: '0.375rem' }}>
            <FiSend size={14} /> {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

function PostCard({ post, onRefresh }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const [likeLoading, setLikeLoading] = useState(false)
  const qc = useQueryClient()

  const isLiked = post.likes?.some(l => (l.user?._id || l.user) === user?._id)
  const refresh = () => qc.invalidateQueries(['posts'])

  const toggleLike = async () => {
    setLikeLoading(true)
    try {
      isLiked ? await postService.unlikePost(post._id) : await postService.likePost(post._id)
      refresh()
    } catch (err) { toast.error(err.message) }
    finally { setLikeLoading(false) }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    try {
      await postService.addComment(post._id, comment)
      setComment('')
      refresh()
    } catch (err) { toast.error(err.message) }
  }

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return
    try { await postService.deletePost(post._id); refresh(); toast.success('Post deleted') }
    catch (err) { toast.error(err.message) }
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  return (
    <div className="card post-card fade-in">
      <div className="post-header">
        <Avatar user={post.author} size="md" />
        <div className="post-author-info" style={{ flex: 1 }}>
          <h4>{post.author?.firstName} {post.author?.lastName}</h4>
          <p>{post.author?.headline || post.author?.company}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeAgo}</p>
        </div>
        {post.author?._id === user?._id && (
          <button className="btn btn-ghost btn-icon" onClick={deletePost} title="Delete post"><FiTrash2 size={15} /></button>
        )}
      </div>
      <p className="post-content">{post.content}</p>
      {post.media?.length > 0 && (
        <img src={post.media[0].url} alt="post media" style={{ borderRadius: 'var(--radius-md)', width: '100%', marginBottom: '0.75rem', maxHeight: 400, objectFit: 'cover' }} />
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {post.likesCount > 0 && <span>❤️ {post.likesCount}</span>}
        {post.commentsCount > 0 && <span>{post.commentsCount} comments</span>}
      </div>
      <div className="post-actions">
        <button className={`post-action-btn ${isLiked ? 'liked' : ''}`} onClick={toggleLike} disabled={likeLoading}>
          <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} /> Like
        </button>
        <button className="post-action-btn" onClick={() => setShowComments(v => !v)}>
          <FiMessageSquare size={16} /> Comment
        </button>
        <button className="post-action-btn"><FiShare2 size={16} /> Share</button>
      </div>
      {showComments && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          {post.comments?.slice(-3).map(c => (
            <div key={c._id} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Avatar user={c.user} size="sm" />
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', flex: 1 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.user?.firstName} {c.user?.lastName}</p>
                <p style={{ fontSize: '0.85rem', marginTop: 2 }}>{c.text}</p>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Avatar user={user} size="sm" />
            <input value={comment} onChange={e => setComment(e.target.value)} className="form-input" placeholder="Write a comment..." style={{ flex: 1, borderRadius: 'var(--radius-full)' }} />
            <button type="submit" className="btn btn-primary btn-sm"><FiSend size={14} /></button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['posts'], queryFn: () => postService.getPosts({ limit: 20 }) })
  const posts = data?.data || []

  return (
    <div className="main-layout">
      {/* Left sidebar */}
      <aside className="left-sidebar">
        <ProfileSideCard />
      </aside>
      {/* Main feed */}
      <main className="feed-section">
        <CreatePost onCreated={refetch} />
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="card" style={{ height: 150 }}>
              <div className="skeleton" style={{ height: '100%', borderRadius: 'var(--radius-md)' }} />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📰</div>
            <h3>Your feed is empty</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Connect with people to see their posts here</p>
          </div>
        ) : (
          posts.map(post => <PostCard key={post._id} post={post} onRefresh={refetch} />)
        )}
      </main>
      {/* Right sidebar */}
      <aside className="right-sidebar">
        <TrendingTopics />
      </aside>
    </div>
  )
}

function ProfileSideCard() {
  const { user } = useAuth()
  return (
    <div className="card" style={{ position: 'sticky', top: '72px' }}>
      <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
        <Avatar user={user} size="xl" style={{ margin: '0 auto' }} />
        <h3 style={{ marginTop: '0.75rem', fontSize: '1rem' }}>{user?.firstName} {user?.lastName}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{user?.headline || 'Add a headline'}</p>
      </div>
      <div className="divider" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <StatRow label="Connections" value={user?.connectionsCount || 0} />
        <StatRow label="Followers" value={user?.followersCount || 0} />
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function TrendingTopics() {
  const topics = ['#opentowork', '#hiring', '#javascript', '#ai', '#startup', '#networking']
  return (
    <div className="card" style={{ position: 'sticky', top: '72px' }}>
      <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Trending Topics</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {topics.map(t => (
          <div key={t} style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', fontSize: '0.85rem', cursor: 'pointer', transition: 'var(--transition)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}>
            <span style={{ color: 'var(--brand-500)', fontWeight: 600 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
