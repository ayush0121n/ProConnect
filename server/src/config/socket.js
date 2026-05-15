const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { handleMessageSocket } = require('../sockets/messageSocket');
const { handleNotificationSocket } = require('../sockets/notificationSocket');
const { handleOnlineStatus } = require('../sockets/onlineStatus');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (process.env.NODE_ENV === 'production' || !origin || [
          'http://localhost:5173',
          'http://localhost:5000',
          ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim().replace(/\/$/, '')) : [])
        ].includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.user._id}`);

    // Handle online status
    handleOnlineStatus(io, socket);

    // Handle messages
    handleMessageSocket(io, socket);

    // Handle notifications
    handleNotificationSocket(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.user._id}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
