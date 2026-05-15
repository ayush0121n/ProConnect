import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { messageService } from '../../services/services'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import Avatar from '../../components/common/Avatar'
import toast from 'react-hot-toast'
import { FiSend, FiMessageSquare } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef()

  const activeConvRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Keep activeConvRef in sync
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  const { data: convData } = useQuery({ queryKey: ['conversations'], queryFn: messageService.getConversations })
  const conversations = convData?.data || []

  useEffect(() => {
    if (!activeConv) return
    messageService.getMessages(activeConv._id).then(r => setMessages(r.data)).catch(() => {})
  }, [activeConv])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!socket) return
    const handleNewMessage = (msg) => {
      const current = activeConvRef.current
      if (current && (msg.conversation === current._id)) {
        setMessages(prev => [...prev, msg])
      }
    }
    const handleTyping = () => setTyping(true)
    const handleStopTyping = () => setTyping(false)
    socket.on('newMessage', handleNewMessage)
    socket.on('userTyping', handleTyping)
    socket.on('userStopTyping', handleStopTyping)
    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('userTyping', handleTyping)
      socket.off('userStopTyping', handleStopTyping)
    }
  }, [socket])

  // Cleanup typing timeout on unmount
  useEffect(() => () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current) }, [])

  const getOtherUser = (conv) => conv.participants?.find(p => p._id !== user?._id)

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeConv) return
    setSending(true)
    try {
      const other = getOtherUser(activeConv)
      const res = await messageService.sendMessage(other._id, text)
      setMessages(prev => [...prev, res.data])
      setText('')
    } catch (err) { toast.error(err.message) }
    finally { setSending(false) }
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    if (socket && activeConv) {
      const other = getOtherUser(activeConv)
      socket.emit('typing', { conversationId: activeConv._id, recipientId: other?._id })
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { conversationId: activeConv._id, recipientId: other?._id })
      }, 1500)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 1rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Messages</h1>
      <div className="messages-layout">
        {/* Chat List */}
        <div className="chat-list">
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <input className="form-input" placeholder="Search messages..." style={{ borderRadius: 'var(--radius-full)' }} />
          </div>
          {conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <FiMessageSquare size={32} opacity={0.3} />
              <p style={{ fontSize: '0.85rem' }}>No conversations yet</p>
            </div>
          ) : conversations.map(conv => {
            const other = getOtherUser(conv)
            return (
              <div key={conv._id} className={`chat-list-item ${activeConv?._id === conv._id ? 'active' : ''}`} onClick={() => setActiveConv(conv)}>
                <Avatar user={other} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{other?.firstName} {other?.lastName}</p>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.lastMessage?.content || 'Start a conversation'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {activeConv ? (
            <>
              {/* Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)' }}>
                {(() => { const other = getOtherUser(activeConv); return (<><Avatar user={other} size="md" /><div><p style={{ fontWeight: 600 }}>{other?.firstName} {other?.lastName}</p><p style={{ fontSize: '0.75rem', color: other?.isOnline ? '#22c55e' : 'var(--text-muted)' }}>{other?.isOnline ? '● Online' : 'Offline'}</p></div></>) })()}
              </div>
              {/* Messages */}
              <div className="chat-messages">
                {messages.map(msg => {
                  const isMine = (msg.sender?._id || msg.sender) === user?._id
                  return (
                    <div key={msg._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div className={`message-bubble ${isMine ? 'sent' : 'received'}`}>{msg.content}</div>
                    </div>
                  )
                })}
                {typing && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>typing...</div>}
                <div ref={bottomRef} />
              </div>
              {/* Input */}
              <form className="chat-input-area" onSubmit={sendMessage}>
                <input id="message-input" className="chat-input" placeholder="Type a message..." value={text} onChange={handleTyping} />
                <button id="send-message-btn" type="submit" disabled={sending || !text.trim()} className="btn btn-primary btn-icon"><FiSend size={16} /></button>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <FiMessageSquare size={48} opacity={0.3} />
              <h3>Select a conversation</h3>
              <p style={{ fontSize: '0.875rem' }}>Choose from your conversations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
