const express = require("express");
const {
  createChat,
  findChatByMember,
  findChatByName,
  kickMember,
  addMember,
  outChat,
  passLeader,
  deleteChat,
  findChatByIdUser,
} = require("../controllers/ChatController");
const checkAuth = require("../middlewares/checkAuth");
const { uploadCloud } = require("../middlewares/cloudinary");

const router = express.Router();

router.use(checkAuth);
router.post("/", uploadCloud.single("image"), createChat);
router.get("/:userId", findChatByIdUser);
router.get("/", findChatByName);
router.get("/memberId/:memberId", findChatByMember);
router.put("/add/:chatId", addMember);
router.put("/out/:chatId", outChat);
router.put("/:chatId/:memberId", kickMember);
router.put("/leader/:chatId/:userId", passLeader);
router.delete("/:chatId", deleteChat);

module.exports = router;
