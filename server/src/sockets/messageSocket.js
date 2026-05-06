const handleMessageSocket = (io, socket) => {
  // Join user's personal room for direct messages
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leaveConversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Typing indicators
  socket.on('typing', ({ conversationId, recipientId }) => {
    socket.to(`user_${recipientId}`).emit('userTyping', {
      userId: socket.user._id,
      conversationId
    });
  });

  socket.on('stopTyping', ({ conversationId, recipientId }) => {
    socket.to(`user_${recipientId}`).emit('userStopTyping', {
      userId: socket.user._id,
      conversationId
    });
  });
};

module.exports = { handleMessageSocket };
