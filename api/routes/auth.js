const express = require("express");
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
} = require("../controllers/AuthController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refreshtoken", refreshToken);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

module.exports = router;
