const express = require("express");
require("dotenv").config();
require("./config/connectDB");
const cors = require("cors");
const createError = require("http-errors");
const bodyParser = require("body-parser");
const http = require("http");
const socketio = require("socket.io");

//socket
const socket = require("./config/socket");

// Router
const authRouter = require("./api/routes/auth");
const userRouter = require("./api/routes/user");
const postRouter = require("./api/routes/post");
const commentRouter = require("./api/routes/comment");
const chatRouter = require("./api/routes/chat");
const messageRouter = require("./api/routes/message");

const PORT = process.env.PORT;
const app = express();

//config
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//create server socket
const server = http.createServer(app);
const io = socketio(server);
socket(io);

// router
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/chat", chatRouter);
app.use("/message", messageRouter);

app.use((req, res, next) => {
  next(createError.NotFound("This route does not exist!"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

server.listen(PORT, () => {
  console.log(`App running on ${PORT}`);
});
