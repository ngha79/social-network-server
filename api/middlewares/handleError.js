const error = require("http-errors");

const NotFound = (req, res, next) => {
  next(error.NotFound("This route does not exist!"));
};

const Error = (err, req, res, next) => {
  res.json({
    status: err.status || 500,
    message: err.message,
  });
};

module.exports = { NotFound, Error };
