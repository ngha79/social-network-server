const { createClient } = require("redis");

const redis = createClient({
  password: process.env.PASSWORD_REDIS,
  socket: {
    host: process.env.HOST_REDIS,
    port: process.env.PORT_REDIS,
  },
});
redis.on("error", (err) => console.log("Redis Error: ", err));
redis.on("connect", () => console.log("Redis Connected"));
redis.connect();

// Join user to chat
const userJoin = async (userId, socketId) => {
  const user = {
    userId: userId,
    socketId: socketId,
    isOnline: "true",
    lastLogin: "null",
  };
  await redis.hSet(`user:${userId}`, user);
};

// Get current user
const getCurrentUser = async (userId) => {
  let user = await redis.hGetAll(`user:${userId}`);
  return user;
};

// User leaves chat
const userLeave = async (userId) => {
  const user = await redis.hGetAll(`user:${userId}`);
  if (user.userId) {
    await redis.hSet(`user:${userId}`, {
      isOnline: "false",
      lastLogin: new Date().toString(),
    });
  }
};

const userLeaveSocket = async (userId) => {
  const user = await redis.hGetAll(`user:${userId}`);
  if (user.userId) {
    await redis.hSet(`user:${userId}`, {
      ...user,
      isOnline: "false",
      lastLogin: new Date().toString(),
    });
  }
};

const getUserOnline = async (userId, cb) => {
  const cachedUser = await redis.hGetAll(`user:${userId}`);
  if (cachedUser.userId) {
    const { isOnline, lastLogin } = cachedUser;
    cb({ isOnline, lastLogin });
  }
};

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  userLeaveSocket,
  getUserOnline,
};
