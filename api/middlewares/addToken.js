const UserModel = require("../models/user.Model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/GenerateToken");

const generateAccessTokenAndRefreshToken = async (id) => {
  const token = await generateAccessToken(id);
  const refreshToken = await generateRefreshToken(id);
  await UserModel.findByIdAndUpdate(id, { refreshToken: refreshToken });
  return { token, refreshToken };
};

module.exports = generateAccessTokenAndRefreshToken;
