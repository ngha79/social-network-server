const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.Model");
const { verifyAccessToken } = require("../utils/GenerateToken");
const createError = require("http-errors");

const checkAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const { data } = await verifyAccessToken(token);
    const user = await UserModel.findById(data).select(
      "-password -refreshToken"
    );
    if (!user) {
      next(createError.InternalServerError("User not found!"));
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      error: "Not authorized to access this resource!",
    });
  }
};

module.exports = checkAuth;
