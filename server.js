const express = require("express");
require("dotenv").config();
require("./config/connectDB");
const cors = require("cors");
const createError = require("http-errors");

// Router
const authRouter = require("./api/routes/auth");
const userRouter = require("./api/routes/user");

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use((req, res, next) => {
  next(createError.NotFound("This route does not exist!"));
});

app.use((err, req, res, next) => {
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
