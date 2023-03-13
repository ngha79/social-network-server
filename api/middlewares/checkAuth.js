const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer", "");
  } catch (error) {
    res.status(401).json({
      status: 401,
      error: "Not authorized to access this resource!",
    });
  }
};

module.exports = checkAuth;
