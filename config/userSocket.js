let users = [];

// Join user to chat
function userJoin(userId, socketId) {
  users = users.filter((user) => user.user._id !== userId._id);
  users.push({ user: userId, socketId });
  return;
}

// Get current user
function getCurrentUser(id) {
  const user = users.filter((user) => user.user._id === id);
  return user;
}

// User leaves chat
function userLeave(id) {
  const user = users.filter((user) => user.user._id !== id);
  return user;
}

function userLeaveSocket(id) {
  const userDis = users.filter((user) => user.socketId === id);
  return users.filter((user) => user.user._id !== userDis[0].user._id);
}
//Check user
function checkUser(id, chatId) {
  return users.some((user) => {
    if (user.id === id && chatId === user.chatId) {
      return true;
    }
    return false;
  });
}

// Get room users
function getRoomUsers(chatId) {
  return users.filter((user) => user.chatId === chatId);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  checkUser,
  userLeaveSocket,
};
