const createError = require("http-errors");
const ChatModel = require("../models/chat.Model");
const MessageModel = require("../models/message.Model");

const createMessage = async (req, res, next) => {
  let { chat, senderId, receiver } = req.body;
  let image;
  try {
    //create new chat if req.body.chat == null
    if (!chat) {
      const members = [senderId, receiver];
      let newchat = await ChatModel.create({ members });
      req.body.chat = newchat.id;
    }

    // add image
    if (req.file) {
      image = { url: req.file.path, public_id: req.file.filename };
      req.body.image = image;
    }

    const newMessage = await MessageModel.create(req.body);
    res.json(newMessage);
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
    );

    res.json({ message: "Delete success.", message });
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
    );
    res.json({ message: "Like message success.", likeMessage });
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
    );
    res.json({ message: "Remove like message success.", removelikeMessage });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

module.exports = {
  createMessage,
  deleteMessage,
  likeMessage,
  removeLikeMessage,
};
