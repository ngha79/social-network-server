const {
  userJoin,
  getCurrentUser,
  userLeave,
  checkUser,
  getRoomUsers,
} = require("./userSocket");

const socket = (io) => {
  io.on("connect", (socket) => {
    socket.emit("message", "tin nhan");

    socket.on("joinRoom", ({ chatId, userId }) => {
      socket.join(chatId);
    });

    socket.on("addMessage", ({ msg, chatId }) => {
      socket.to(chatId).emit("receiverMessage", { receiver: msg });
    });

    socket.on("delMessage", ({ msg, chatId }) => {
      socket.to(chatId).emit("updateMessageDel", { delete: msg });
    });

    socket.on("likeMessage", ({ msg, chatId }) => {
      socket.to(chatId).emit("updateMessageLike", { like: msg });
    });

    socket.on("unlikeMessage", ({ msg, chatId }) => {
      socket.to(chatId).emit("updateMessageUnLike", { unlike: msg });
    });

    socket.on("passLeader", ({ msg, chatId }) => {
      socket.to(chatId).emit("passLeaderSend", { updateChat: msg });
    });

    socket.on("deleteChat", ({ msg, chatId }) => {
      socket.to(chatId).emit("deleteChatSend", { updateChat: msg });
    });

    socket.on("addMember", ({ msg, chatId, memberId }) => {
      console.log(msg);
      socket
        .to(chatId)
        .emit("addMemberSend", { updateChat: msg, memberId: memberId });
    });

    socket.on("kickMember", ({ msg, chatId, memberKick }) => {
      socket
        .to(chatId)
        .emit("kickMemberSend", { updateChat: msg, memberId: memberKick });
    });

    socket.on("exitChat", ({ msg, chatId }) => {
      console.log(msg);
      socket.to(chatId).emit("exitChatSend", { updateChat: msg });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = socket;
