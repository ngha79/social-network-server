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
  getUserIsNotFriendMore,
  getAllSendFriendMore,
  getAllInvitedFriendsMore,
  updateUserInfo,
} = require("../controllers/UserController");
const checkAuth = require("../middlewares/checkAuth");
const { uploadCloud } = require("../middlewares/cloudinary");

const router = express.Router();

router.use(checkAuth);
router.get("/get-user-by-name/:name", getUserByName);
router.get("/get-user-by-id/:id", getUserById);
router.get("/user-is-not-friend", getUserIsNotFriend);
router.get("/all-friend", getAllFriend);
router.get("/all-send-friend", getAllSendFriend);
router.get("/all-invited-friend", getAllInvitedFriends);
router.get("/more-friend", getUserIsNotFriendMore);
router.get("/send-friend", getAllSendFriendMore);
router.get("/invited-friend", getAllInvitedFriendsMore);
router.put("/send-friend-invitation/:userInvite", sendFriendInvitation);
router.put("/accept-friend/:userAccept", acceptFriend);
router.put("/delete-friend/:friendId", deleteFriend);
router.put("/delete-send-friend/:userReceiverId", deleteSendFriend);
router.put("/delete-invited-friend/:userSendId", deleteInvitedFriend);
router.put("/update-user-info", uploadCloud.single("avatar"), updateUserInfo);

router.post("/change-password", changePassword);

module.exports = router;
