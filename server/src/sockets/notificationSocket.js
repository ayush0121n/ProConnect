const handleNotificationSocket = (io, socket) => {
  // User can mark notifications as read via socket
  socket.on('markNotificationRead', (notificationId) => {
    // Frontend handles local state; backend is handled via REST
    socket.emit('notificationRead', { notificationId });
  });
};

/**
 * Emit a notification to a specific user
 * Called from controllers when creating notifications
 */
const emitNotification = (io, userId, notification) => {
  io.to(`user_${userId}`).emit('notification', notification);
};

module.exports = { handleNotificationSocket, emitNotification };
