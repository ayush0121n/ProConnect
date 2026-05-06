import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()
export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const s = io(import.meta.env.VITE_SOCKET_URL || '', {
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket'],
      })
      s.on('getOnlineUsers', setOnlineUsers)
      setSocket(s)
      return () => s.close()
    } else {
      socket?.close()
      setSocket(null)
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline: (id) => onlineUsers.includes(id?.toString()) }}>
      {children}
    </SocketContext.Provider>
  )
}
