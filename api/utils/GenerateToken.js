const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const tokenUtils = {
  generateAccessToken: async (data) => {
    if (!data) return null;
    return await jwt.sign({ data }, ACCESS_TOKEN_SECRET, {
      expiresIn: 1000 * 60,
    });
  },

  verifyAccessToken: async (token) => {
    if (!token) return new Error("Token invalid!");
    return await jwt.verify(token, ACCESS_TOKEN_SECRET);
  },

  generateRefreshToken: async (data) => {
    if (!data) return null;
    return await jwt.sign({ data }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  },

  verifyRefreshToken: async (token) => {
    if (!token) return new Error("Token invalid!");
    return await jwt.verify(token, REFRESH_TOKEN_SECRET);
  },
};

module.exports = tokenUtils;
