const mongoose = require("mongoose");
require("dotenv").config();
const { MONGODB_URI } = process.env;

module.exports = mongoose
  .set("strictQuery", true)
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to database success.");
  })
  .catch((err) => {
    console.error("Connected to database failed! ", err);
  });
