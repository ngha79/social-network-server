const createError = require("http-errors");
const ChatModel = require("../models/chat.Model");
const UserModel = require("../models/user.Model");

const createChat = async (req, res, next) => {
  let { members } = req.body;
  const { id } = req.user;
  try {
    members.push(id);
    if (members.length > 2) {
      req.body.leader = id;
    }
    const newChat = await ChatModel.create(req.body);
    res.json({ newChat });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const findChatById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const Chats = await ChatModel.find({ userId });
    res.json({ Chats });
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
    if (chat.leader.toString() !== id.toString()) {
      return res.json("Bạn không phải là trưởng nhóm!");
    }
    chat.members.pull(memberId);
    await chat.save();
    res.json({ chat });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const addMember = async (req, res, next) => {
  const { memberId, chatId } = req.params;
  const { id } = req.user;
  try {
    let chat = await ChatModel.findById(chatId);
    if (chat.leader.toString() !== id.toString()) {
      return res.json("Bạn không phải là trưởng nhóm!");
    }
    chat.members.addToSet(memberId);
    await chat.save();
    res.json({ chat });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const outChat = async (req, res, next) => {
  const { chatId } = req.params;
  const { id } = req.user;
  try {
    let chat = await ChatModel.findById(chatId);
    if (chat.leader.toString() === id.toString()) {
      return res.json("Bạn phải nhường lại chức vụ trước khi rời nhóm!");
    }
    chat.members.pull(id);
    await chat.save();
    res.json({ chat });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const passLeader = async (req, res, next) => {
  const { userId, chatId } = req.params;
  const { id } = req.user;
  try {
    let chat = await ChatModel.findById(chatId);
    if (chat.leader.toString() !== id.toString()) {
      return res.json("Bạn không phải nhóm trưởng!");
    }
    chat = await ChatModel.findByIdAndUpdate(chatId, { leader: userId });
    res.json({ chat });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deleteChat = async (req, res, next) => {
  const { chatId } = req.params;
  const { id } = req.user;
  try {
    let chat = await ChatModel.findById(chatId);
    if (chat.leader.toString() !== id.toString()) {
      return res.json("Bạn không phải nhóm trưởng!");
    }
    await ChatModel.findByIdAndDelete(chatId);
    res.json({
      message: "Xóa nhóm thành công",
    });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

module.exports = {
  createChat,
  findChatById,
  findChatByName,
  kickMember,
  addMember,
  outChat,
  passLeader,
  deleteChat,
};
