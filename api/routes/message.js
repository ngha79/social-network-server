const express = require("express");
const {
  createMessage,
  deleteMessage,
  likeMessage,
  removeLikeMessage,
} = require("../controllers/MessageController");
const checkAuth = require("../middlewares/checkAuth");
const { uploadCloud } = require("../middlewares/cloudinary");
const router = express.Router();

router.use(checkAuth);
router.post("/", uploadCloud.single("image"), createMessage);
router.put("/:messageId", deleteMessage);
router.put("/like/:messageId", likeMessage);
router.put("/removelike/:messageId", removeLikeMessage);

module.exports = router;
