const express = require("express");
const {
  changePassword,
  getUserByName,
  getUserById,
  sendFriendInvitation,
  acceptFriend,
  deleteFriend,
  deleteSendFriend,
  getAllFriend,
  getAllSendFriend,
  getAllInvitedFriends,
  deleteInvitedFriend,
  getUserIsNotFriend,
} = require("../controllers/UserController");
const checkAuth = require("../middlewares/checkAuth");

const router = express.Router();

router.use(checkAuth);
router.get("/get-user-by-name", getUserByName);
router.get("/get-user-by-id/:id", getUserById);
router.get("/user-is-not-friend", getUserIsNotFriend);
router.get("/all-friend", getAllFriend);
router.get("/all-send-friend", getAllSendFriend);
router.get("/all-invited-friend", getAllInvitedFriends);
router.put("/send-friend-invitation/:userInvite", sendFriendInvitation);
router.put("/accept-friend/:userAccept", acceptFriend);
router.put("/delete-friend/:friendId", deleteFriend);
router.put("/delete-send-friend/:userReceiverId", deleteSendFriend);
router.put("/delete-invited-friend/:userSendId", deleteInvitedFriend);

router.post("/change-password", changePassword);

module.exports = router;
