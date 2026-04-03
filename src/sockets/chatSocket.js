export const registerChatSocket = (socket, io) => {
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (payload) => {
    io.to(payload.chatId).emit("receive_message", payload);
  });
};