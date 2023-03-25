const users = [];

// Join user to chat
function userJoin(id, userId, chatId) {
  const user = { id, userId, chatId };

  users.push(user);
  console.log(users);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.filter((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
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
};
