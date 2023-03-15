const express = require("express");
const {
  createChat,
  findChatById,
  findChatByName,
  kickMember,
  addMember,
  outChat,
  passLeader,
  deleteChat,
} = require("../controllers/ChatController");
const checkAuth = require("../middlewares/checkAuth");
const { uploadCloud } = require("../middlewares/cloudinary");

const router = express.Router();

router.use(checkAuth);
router.post("/", uploadCloud.single("image"), createChat);
router.get("/:userId", findChatById);
router.get("/", findChatByName);
router.put("/:chatId/:memberId", kickMember);
router.put("/add/:chatId/:memberId", addMember);
router.put("/out/:chatId", outChat);
router.put("/leader/:chatId/:userId", passLeader);
router.delete("/:chatId", deleteChat);

module.exports = router;
