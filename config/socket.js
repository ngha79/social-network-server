const socket = (io) => {
  io.on("connect", (socket) => {
    socket.on("disconnect", () => {
      const userId = socket.userId;
    });
  });
};

module.exports = socket;
