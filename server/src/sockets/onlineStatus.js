const onlineUsers = new Map(); // userId -> socketId

const handleOnlineStatus = (io, socket) => {
  const userId = socket.user._id.toString();

  // Add user to online map and join personal room
  onlineUsers.set(userId, socket.id);
  socket.join(`user_${userId}`);

  // Broadcast online users list
  io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));

  // Handle disconnect
  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
  });
};

const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { handleOnlineStatus, getOnlineUsers };
