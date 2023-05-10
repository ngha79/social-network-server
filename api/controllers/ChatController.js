const createError = require("http-errors");
const ChatModel = require("../models/chat.Model");
const UserModel = require("../models/user.Model");
const MessageModel = require("../models/message.Model");
const { default: mongoose } = require("mongoose");

const createChat = async (req, res, next) => {
  let members = req.body.members;
  const { id } = req.user;
  try {
    const array = members.split(",");
    array.push(id);
    req.body.members = array;
    if (req.file) {
      req.body.image = req.file.path;
    } else {
      req.body.image =
        "https://res.cloudinary.com/dlzulba2u/image/upload/v1679133271/avatar/aufm0qxhfuph971kck46.png";
    }
    let newChat = await ChatModel.create(req.body);
    newChat = await newChat.populate("members", "-password -refreshToken");
    let objectIdArray = req.body.members.map(
      (s) => new mongoose.Types.ObjectId(s)
    );
    await UserModel.updateMany(
      { _id: { $in: objectIdArray } },
      { $addToSet: { chats: newChat.id } },
      {
        new: true,
      }
    );
    res.json(newChat);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const findChatByIdUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const Chats = await ChatModel.find({ members: { $in: userId } }).populate(
      "members",
      "-password -refreshToken"
    );
    res.json(Chats);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const findChatByMember = async (req, res, next) => {
  const { memberId } = req.params;
  const { id } = req.user;
  try {
    const Chats = await ChatModel.find({
      $and: [
        { $or: [{ members: [id, memberId] }, { members: [memberId, id] }] },
        { type: "Message" },
      ],
    }).populate("members", "-password -refreshToken");
    res.json(Chats);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const findChatByName = async (req, res, next) => {
  const { name } = req.body;
  try {
    const chat = await ChatModel.find({ name: { $regex: name } }).populate(
      "members",
      "name avatar"
    );
    const users = await UserModel.find({ name: { $regex: name } }).select(
      "name avatar"
    );
    res.json({ chat, users });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const kickMember = async (req, res, next) => {
  const { memberId, chatId } = req.params;
  const { id } = req.user;
  try {
    let chat = await ChatModel.findById(chatId);

    if (chat.leader != id) {
      return res.json("Bạn không phải là trưởng nhóm!");
    }
    chat = await ChatModel.findByIdAndUpdate(
      { _id: chatId },
      {
        $pull: { members: memberId },
      },
      { new: true }
    ).populate("members", "-password -refreshToken");
    await UserModel.findByIdAndUpdate(memberId, { $pull: { chats: chatId } });
    res.json({ chat, memberId });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const addMember = async (req, res, next) => {
  const { memberId } = req.body;
  const { chatId } = req.params;
  const { id } = req.user;
  try {
    if (memberId.length > 1) {
      const array = memberId.split(",");
      req.body.memberId = array;
    }
    let chat = await ChatModel.findById(chatId);
    if (chat.leader != id) {
      return res.json("Bạn không phải là trưởng nhóm!");
    }
    chat = await ChatModel.findByIdAndUpdate(
      { _id: chatId },
      {
        $addToSet: { members: memberId },
      },
      { new: true }
    ).populate("members", "-password -refreshToken");
    await UserModel.findByIdAndUpdate(memberId, {
      $addToSet: { chats: chatId },
    });

    res.json({ chat, memberId });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const outChat = async (req, res, next) => {
  const { id } = req.user;
  const { chatId } = req.params;
  try {
    let chat = await ChatModel.findById(chatId);
    if (chat.leader == id) {
      return res.json("Bạn phải nhường lại chức vụ trước khi rời nhóm!");
    }
    chat = await ChatModel.findByIdAndUpdate(
      { _id: chatId },
      {
        $pull: { members: id },
      },
      { new: true }
    ).populate("members", "-password -refreshToken");
    await UserModel.findByIdAndUpdate(id, {
      $pull: { chats: chatId },
    });

    res.json(chat);
  } catch (error) {
    next(createError.InternalServerError(error));
  }
};

const passLeader = async (req, res, next) => {
  const { userId, chatId } = req.params;
  const { id } = req.user;
  try {
    let chat = await ChatModel.findById(chatId);
    if (chat.leader != id) {
      return res.json("Bạn không phải nhóm trưởng!");
    }
    chat = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        leader: userId,
      },
      { new: true }
    ).populate("members", "-password -refreshToken");
    res.json(chat);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deleteChat = async (req, res, next) => {
  const { chatId } = req.params;
  const { id } = req.user;
  try {
    let chat = await ChatModel.findById(chatId);
    if (chat.leader != id) {
      return res.json("Bạn không phải nhóm trưởng!");
    }
    await ChatModel.findByIdAndDelete(chatId);
    await MessageModel.deleteMany({ chat: chatId });
    let objectIdArray = chat.members.map((s) => new mongoose.Types.ObjectId(s));
    await UserModel.updateMany(
      { _id: { $in: objectIdArray } },
      { $pull: { chats: chatId } },
      {
        new: true,
      }
    );
    res.json(chat);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

module.exports = {
  createChat,
  findChatByIdUser,
  findChatByMember,
  findChatByName,
  kickMember,
  addMember,
  outChat,
  passLeader,
  deleteChat,
};
