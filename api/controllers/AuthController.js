const createError = require("http-errors");
const { sendEmail } = require("../helpers/sendMail");
const generateAccessTokenAndRefreshToken = require("../middlewares/addToken");
const UserModel = require("../models/user.Model");
const crypto = require("crypto");

const {
  generateRefreshToken,
  generateAccessToken,
  verifyRefreshToken,
} = require("../utils/GenerateToken");
const {
  validationUser,
  validationPassword,
} = require("../validates/userValidate");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { error } = validationUser({ email, password });
    if (error) {
      return next(createError.InternalServerError(error));
    }
    const emailExist = await UserModel.findOne({ email });
    if (emailExist) {
      return next(createError.InternalServerError("Email đã tồn tại!"));
    }
    if (req.file) {
      let avatar = { url: req.file.path, public_id: req.file.filename };
      req.body.avatar = avatar;
    }
    const newUser = await UserModel.create(req.body);
    return res.json({ message: "Tạo tài khoản thành công.", newUser });
  } catch (error) {
    console.log(error.message);
    next(createError.InternalServerError(error.message));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { error } = validationUser({ email, password });
    if (error) {
      return next(createError.InternalServerError(error));
    }
    let user = await UserModel.findOne({ email });
    if (!user) return next(createError.NotFound("Email không tồn tại!"));
    const checkPassword = await user.isComparePassword(password);
    if (!checkPassword)
      return next(createError.NotFound("Mật khẩu không chính xác!"));

    // create token
    const { token, refreshToken } = await generateAccessTokenAndRefreshToken(
      user.id
    );
    user = await UserModel.findOne({ email })
      .populate("friends", "-password -refreshToken")
      .select("-password -refreshToken");

    return res.json({ token, refreshToken, user });
  } catch (error) {
    console.log(error);
    next(createError.InternalServerError(error.message));
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const { data } = await verifyRefreshToken(refreshToken);
    const user = UserModel.findOne({
      data,
      refreshToken: {
        $elemMatch: { refreshToken: refreshToken },
      },
    });
    if (!user) {
      next(createError.Unauthorized("Not authorize"));
    }
    const token = await generateAccessToken(data);
    res.json(token);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return next(createError.NotFound("Tài khoản không tồn tại!"));
    const token = await user.createPasswordResetToken();
    await user.save();
    const reserUrl = `Hi, Please follow this link to create new password for your account, click to reset password <a href='http://localhost:5000/auth/reset-password/${token}'>Click here</a>`;
    const data = {
      to: email,
      text: `Hi ${user.name}`,
      subject: "Forgot password link",
      htm: reserUrl,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const { error } = validationPassword({ password });
  if (error)
    return next(createError.InternalServerError("Mật khẩu không hợp lệ!"));
  const hashToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await UserModel.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw createError.InternalServerError("Time expired, please try again!");
  }
  user.password = password;
  user.passwordChangeAt = Date.now();
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  user.save();
  res.status(200).json({
    status: "Success",
    message: "Update password success.",
  });
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
