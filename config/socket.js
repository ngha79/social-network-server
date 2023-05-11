const {
  userJoin,
  getCurrentUser,
  userLeave,
  checkUser,
  getRoomUsers,
  userLeaveSocket,
} = require("./userSocket");

const socket = (io) => {
  io.on("connect", (socket) => {
    // socket.on("joinRoom", ({ chatId, userId }) => {
    //   socket.join(chatId);
    // });

    socket.on("join chats", (chats) => {
      chats.map((chat) => socket.join(chat._id));
    });

    socket.on("set user", (user) => {
      if (user) {
        userJoin(user.user, socket.id);
      }
    });

    socket.on("create group chat", (group) => {
      const users = group.members.map((user) => {
        return getCurrentUser(user._id);
      });
      if (users.length !== 0) {
        users.map((user) => {
          return socket.to(user[0].socketId).emit("create group", group);
        });
      }
    });

    socket.on("new chat from user", (data) => {
      const users = data.members.map((user) => {
        return getCurrentUser(user._id);
      });
      if (users.length !== 0) {
        users.map((user) => {
          return socket.to(user[0].socketId).emit("new message chat", data);
        });
      }
      // socket.to(chatId).emit("receiverMessage", { receiver: msg });
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
      const users = msg.members.map((user) => getCurrentUser(user));
      if (users.length !== 0) {
        users.map((user) => {
          return socket
            .to(user[0].socketId)
            .emit("deleteChatSend", { updateChat: msg });
        });
      }
      socket.leave(chatId);
    });

    socket.on("addMember", ({ msg, chatId, memberId }) => {
      const users = memberId.map((user) => {
        return getCurrentUser(user);
      });
      if (users.length !== 0) {
        users.map((user) => {
          return socket
            .to(user[0].socketId)
            .emit("addMemberSend", { updateChat: msg, memberId: memberId });
        });
      }
      socket
        .to(chatId)
        .emit("addMemberSend", { updateChat: msg, memberId: memberId });
    });

    socket.on("kickMember", ({ msg, chatId, memberId }) => {
      const users = getCurrentUser(memberId);
      if (users.length !== 0) {
        socket
          .to(users[0].socketId)
          .emit("kickMemberSend", { updateChat: msg, memberId: memberId });
      }
      socket
        .to(chatId)
        .emit("kickMemberSend", { updateChat: msg, memberId: memberId });
    });

    socket.on("exitChat", ({ msg, chatId }) => {
      const users = msg.members.map((user) => getCurrentUser(user._id));
      if (users.length !== 0) {
        users.map((user) => {
          return socket
            .to(user[0].socketId)
            .emit("exitChatSend", { updateChat: msg });
        });
      }
      socket.leave(chatId);
    });

    socket.on(
      "subscribe-call-video",
      ({ conversationId, newUserId, peerId }) => {
        socket.join(conversationId);
        socket.broadcast.to(conversationId).emit("new-user-call", {
          conversationId,
          newUserId,
          peerId,
        });

        socket.on("disconnect", () => {
          socket.broadcast
            .to(conversationId)
            .emit("user-disconnected", newUserId);
        });
      }
    );

    socket.on("add friend", (user, userReceiver) => {
      const getUser = getCurrentUser(userReceiver);
      if (getUser.length !== 0) {
        return socket.to(getUser[0].socketId).emit("add friend invited", user);
      }
    });

    socket.on("unfriend", (user, userReceiver) => {
      const getUser = getCurrentUser(userReceiver);
      if (getUser.length !== 0) {
        return socket
          .to(getUser[0].socketId)
          .emit("send unfriend invited", user);
      }
    });

    socket.on("accept friend", (user, userReceiver) => {
      const getUser = getCurrentUser(userReceiver);
      if (getUser.length !== 0) {
        return socket
          .to(getUser[0].socketId)
          .emit("accept invited friend", user);
      }
    });

    socket.on("delete send friend", (user, userReceiver) => {
      const getUser = getCurrentUser(userReceiver);
      if (getUser.length !== 0) {
        return socket
          .to(getUser[0].socketId)
          .emit("delete send invited friend", user);
      }
    });

    socket.on("refuse invited friend", (user, userReceiver) => {
      const getUser = getCurrentUser(userReceiver);
      if (getUser.length !== 0) {
        return socket
          .to(getUser[0].socketId)
          .emit("delete refused invited friend", user);
      }
    });

    socket.on("logout", (id) => {
      userLeave(id);
    });

    socket.on("disconnect", () => {
      userLeaveSocket(socket.id);
    });
  });
};

module.exports = socket;
