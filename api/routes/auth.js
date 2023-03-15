const express = require("express");
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/AuthController");
const { uploadCloud } = require("../middlewares/cloudinary");

const router = express.Router();

router.post("/register", uploadCloud.single("avatar"), register);
router.post("/login", login);
router.post("/refreshtoken", refreshToken);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

module.exports = router;
