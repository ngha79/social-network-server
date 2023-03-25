const createError = require("http-errors");
const { default: mongoose } = require("mongoose");
const ChatModel = require("../models/chat.Model");
const MessageModel = require("../models/message.Model");
const UserModel = require("../models/user.Model");

const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await MessageModel.find({ chat: chatId }).populate(
      "senderId",
      "-password -refreshToken"
    );
    res.json({ chatId: chatId, messages });
  } catch (error) {
    console.log(error);
    next(createError.InternalServerError("Server error"));
  }
};

const createMessage = async (req, res, next) => {
  let { chat, senderId, receiver } = req.body;
  try {
    let image, newchat;
    //create new chat if req.body.chat == null
    if (!chat) {
      const members = [senderId, receiver];
      newchat = await ChatModel.create({ members });
      await newchat.populate("members", "-password -refreshToken");
      let check = newchat;
      let objectIdArray = members.map((s) => new mongoose.Types.ObjectId(s));
      await UserModel.updateMany(
        { _id: { $in: objectIdArray } },
        { $addToSet: { chats: check._id } },
        {
          new: true,
        }
      );
      req.body.chat = newchat.id;
    }

    // add image
    if (req.file) {
      image = { url: req.file.path, public_id: req.file.filename };
      req.body.image = image;
    }

    let newMessage = await MessageModel.create(req.body);
    await newMessage.populate("senderId", "-password -refreshToken");
    res.json({ newMessage, newChat: newchat });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deleteMessage = async (req, res, next) => {
  const { messageId } = req.params;

  try {
    const message = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        message: null,
        image: null,
        isDeleted: true,
      },
      { new: true }
    ).populate("senderId", "-password -refreshToken");

    res.json(message);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const likeMessage = async (req, res, next) => {
  const { messageId } = req.params;
  const { id } = req.user;

  try {
    const likeMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { likes: id },
      },
      { new: true }
    ).populate("senderId", "-password -refreshToken");
    res.json(likeMessage);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const removeLikeMessage = async (req, res, next) => {
  const { messageId } = req.params;
  const { id } = req.user;

  try {
    const removelikeMessage = await MessageModel.findByIdAndUpdate(
      messageId,
      {
        $pull: { likes: id },
      },
      { new: true }
    ).populate("senderId", "-password -refreshToken");
    res.json(removelikeMessage);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

module.exports = {
  getMessages,
  createMessage,
  deleteMessage,
  likeMessage,
  removeLikeMessage,
};
