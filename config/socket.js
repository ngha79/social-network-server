const {
  userJoin,
  getCurrentUser,
  userLeaveSocket,
  getUserOnline,
} = require("./userSocket");

const socket = (io) => {
  io.on("connect", (socket) => {
    socket.on("join chats", (chats) => {
      chats.map((chat) => socket.join(chat._id));
    });

    socket.on("set user", (userId) => {
      if (userId) {
        socket.userId = userId;
        userJoin(userId, socket.id);
      }
    });

    socket.on("get user online", (userId, cb) => {
      getUserOnline(userId, cb);
    });

    socket.on("get user online chat", (members, cb) => {
      members.map((user) => getUserOnline(user._id, cb));
    });

    socket.on("create group chat", async (group) => {
      group.members.map(async (user) => {
        const userget = await getCurrentUser(user._id);
        return socket.to(userget.socketId).emit("create group", group);
      });
    });

    socket.on("new chat from user", (data) => {
      data.members.map(async (user) => {
        const userget = await getCurrentUser(user._id);
        return socket.to(userget.socketId).emit("new message chat", data);
      });
      // socket.to(chatId).emit("receiverMessage", { receiver: msg });
    });

    socket.on("addMessage", ({ msg, chatId }) => {
      socket.broadcast.to(chatId).emit("receiverMessage", { receiver: msg });
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
      msg.members.map(async (user) => {
        const get = await getCurrentUser(user);
        return socket
          .to(get.socketId)
          .emit("deleteChatSend", { updateChat: msg });
      });
      socket.leave(chatId);
    });

    socket.on("addMember", ({ msg, chatId, memberId }) => {
      memberId.map(async (user) => {
        const get = await getCurrentUser(user);
        return socket
          .to(get.socketId)
          .emit("addMemberSend", { updateChat: msg, memberId: memberId });
      });

      socket
        .to(chatId)
        .emit("addMemberSend", { updateChat: msg, memberId: memberId });
    });

    socket.on("kickMember", async ({ msg, chatId, memberId }) => {
      const users = await getCurrentUser(memberId);
      if (users) {
        socket
          .to(users.socketId)
          .emit("kickMemberSend", { updateChat: msg, memberId: memberId });
      }
      socket
        .to(chatId)
        .emit("kickMemberSend", { updateChat: msg, memberId: memberId });
    });

    socket.on("exitChat", ({ msg, chatId }) => {
      msg.members.map(async (user) => {
        const get = await getCurrentUser(user._id);
        return socket
          .to(get.socketId)
          .emit("exitChatSend", { updateChat: msg });
      });
      socket.leave(chatId);
    });

    socket.on(
      "subscribe-call-video",
      ({ conversationId, newUserId, peerId }) => {
        socket.to(conversationId).emit("new-user-call", {
          conversationId,
          newUserId,
          peerId,
        });

        socket.on("disconnect", () => {
          socket.to(conversationId).emit("user-disconnected", newUserId);
        });
      }
    );

    socket.on("add friend", async (user, userReceiver) => {
      const getUser = await getCurrentUser(userReceiver);
      if (getUser) {
        return socket.to(getUser.socketId).emit("add friend invited", user);
      }
    });

    socket.on("unfriend", async (user, userReceiver) => {
      const getUser = await getCurrentUser(userReceiver);
      if (getUser) {
        return socket.to(getUser.socketId).emit("send unfriend invited", user);
      }
    });

    socket.on("accept friend", async (user, userReceiver) => {
      const getUser = await getCurrentUser(userReceiver);
      if (getUser) {
        return socket.to(getUser.socketId).emit("accept invited friend", user);
      }
    });

    socket.on("delete send friend", async (user, userReceiver) => {
      const getUser = await getCurrentUser(userReceiver);
      if (getUser) {
        return socket
          .to(getUser.socketId)
          .emit("delete send invited friend", user);
      }
    });

    socket.on("refuse invited friend", async (user, userReceiver) => {
      const getUser = await getCurrentUser(userReceiver);
      if (getUser) {
        return socket
          .to(getUser.socketId)
          .emit("delete refused invited friend", user);
      }
    });

    socket.on("call video send", (chatId) => {
      if (chatId) {
        socket.to(chatId).emit("call video receiver", chatId);
        socket.chatId = chatId;
      }
    });

    socket.on("call video refuse", (chatId) => {
      if (chatId) socket.to(chatId).emit("call video refuse receiver", chatId);
    });

    socket.on("call video cancel", (chatId) => {
      if (chatId) socket.to(chatId).emit("call video cancel receiver", chatId);
      if (socket.chatId) {
        socket
          .to(socket.chatId)
          .emit("call video cancel receiver", socket.chatId);
      }
    });

    socket.on("is call video", (chatId) => {
      if (chatId) socket.to(chatId).emit("is call video receiver", chatId);
    });

    socket.on("user-disconnected send", (userId, chatId) => {
      socket.to(chatId).emit("user-disconnected", userId);
    });

    socket.on("logout", (userId) => {
      userLeaveSocket(userId);
    });

    socket.on("disconnect", () => {
      userLeaveSocket(socket.userId);
    });
  });
};

module.exports = socket;
