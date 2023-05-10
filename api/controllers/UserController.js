const createError = require("http-errors");
const { default: mongoose, isValidObjectId } = require("mongoose");
const ChatModel = require("../models/chat.Model");
const UserModel = require("../models/user.Model");

const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword, reNewPassword } = req.body;
  const { _id } = req.user;
  try {
    const user = await UserModel.findById(_id);

    if (!user) return next(createError.InternalServerError("Server error!"));
    const checkPassword = await user.isComparePassword(currentPassword);

    if (!checkPassword)
      return next(
        createError.InternalServerError("Mật khẩu hiện tại không đúng!")
      );

    if (newPassword != reNewPassword) {
      return next(
        createError.InternalServerError("Mật khẩu không trùng nhau!")
      );
    }
    user.password = newPassword;
    await user.save();
    res.json({
      message: "Thay đổi mật khẩu thành công!",
    });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getUserByName = async (req, res, next) => {
  const { name } = req.params;
  try {
    const user = await UserModel.find({
      name: {
        $regex: name,
      },
    }).select("-password -refreshToken");
    if (!user) {
      next(createError.NotFound("Không tìm thấy người dùng!"));
    }
    res.json(user);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id)
      .populate("friends", "-password -refreshToken")
      .populate({
        path: "posts",
        populate: [
          {
            path: "comments",
            populate: [
              {
                path: "postedBy reply.postedBy",
                select: "-password -refreshToken",
              },
            ],
          },
          {
            path: "author",
            select: "-password -refreshToken",
          },
        ],
        options: { sort: { createdAt: -1 } },
      })
      .select("-password -refreshToken");
    if (!user) {
      next(createError.NotFound("Không tìm thấy người dùng!"));
    }
    res.json(user);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const sendFriendInvitation = async (req, res, next) => {
  const { userInvite } = req.params;

  const { id } = req.user;

  let user, friend;

  try {
    if (userInvite == id) {
      return next(createError.InternalServerError("Server error!"));
    }
    user = await UserModel.findById(id).select("-password -refreshToken");

    friend = await UserModel.findById(userInvite).select(
      "-password -refreshToken"
    );

    if (!friend) {
      return next(createError.InternalServerError("Server error!"));
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();
    user.sendInvite.addToSet(userInvite);
    await user.save({ session: sess });
    friend.invitedFriends.addToSet(id);
    await friend.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();

    res.json(friend);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const acceptFriend = async (req, res, next) => {
  const { userAccept } = req.params;

  const { id } = req.user;

  let user, friend;

  try {
    if (userAccept == id) {
      return next(createError.InternalServerError("Server error!"));
    }
    user = await UserModel.findById(id).select("-password -refreshToken");

    friend = await UserModel.findById(userAccept).select(
      "-password -refreshToken"
    );
    if (!friend) {
      return next(createError.InternalServerError("Server error!"));
    }

    const Chats = await ChatModel.find({
      $and: [
        { $or: [{ members: [id, userAccept] }, { members: [userAccept, id] }] },
        { type: "Message" },
      ],
    });

    // start session
    const session = await mongoose.startSession();
    session.startTransaction();
    user.friends.addToSet(userAccept);
    user.invitedFriends.pull(userAccept);
    await user.save();
    friend.friends.addToSet(id);
    friend.sendInvite.pull(id);
    await friend.save();
    if (!Chats) {
      await ChatModel.create({ members: [userAccept, id] });
    }
    session.commitTransaction();
    session.endSession();
    //end session

    res.json(friend);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deleteFriend = async (req, res, next) => {
  const { friendId } = req.params;
  const { id } = req.user;
  try {
    const user = await UserModel.findById(id).select("-password -refreshToken");

    const friend = await UserModel.findById(friendId).select(
      "-password -refreshToken"
    );
    if (!friend) {
      return next(createError.InternalServerError("Server error"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    user.friends.pull(friendId);
    await user.save();
    friend.friends.pull(id);
    await friend.save();
    session.commitTransaction();
    session.endSession();

    res.json(friend);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deleteSendFriend = async (req, res, next) => {
  const { userReceiverId } = req.params;
  const { id } = req.user;
  try {
    let user = await UserModel.findById(id).select("-password -refreshToken");

    let userReceiver = await UserModel.findById(userReceiverId).select(
      "-password -refreshToken"
    );

    if (!userReceiver) {
      return next(createError.InternalServerError("Server error!"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    user.sendInvite.pull(userReceiverId);
    await user.save();
    userReceiver.invitedFriends.pull(id);
    await userReceiver.save();
    await session.commitTransaction();
    session.endSession();

    res.json(userReceiver);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deleteInvitedFriend = async (req, res, next) => {
  const { userSendId } = req.params;
  const { id } = req.user;
  try {
    const user = await UserModel.findById(id).select("-password -refreshToken");

    const userInvited = await UserModel.findById(userSendId).select(
      "-password -refreshToken"
    );

    if (!userInvited) {
      return next(createError.InternalServerError("Server error!"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    user.invitedFriends.pull(userSendId);
    await user.save();
    userInvited.sendInvite.pull(id);
    await userInvited.save();
    await session.commitTransaction();
    session.endSession();

    res.json(userInvited);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getAllFriend = async (req, res, next) => {
  const { id } = req.user;
  try {
    const allFriend = await UserModel.find({ friends: { $in: [id] } }).select(
      "-password -refreshToken"
    );
    res.json(allFriend);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getAllSendFriend = async (req, res, next) => {
  const { id } = req.user;
  try {
    const sendInvite = await UserModel.find({
      invitedFriends: { $in: id },
    })
      .select("-password -refreshToken")
      .limit(4);
    res.json(sendInvite);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getAllInvitedFriends = async (req, res, next) => {
  const { id } = req.user;
  try {
    const invitedFriends = await UserModel.find({
      sendInvite: { $in: id },
    })
      .select("-password -refreshToken")
      .limit(4);
    res.json(invitedFriends);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getUserIsNotFriend = async (req, res, next) => {
  const { id } = req.user;
  try {
    const user = await UserModel.findById(id);
    const isNotFriend = await UserModel.find({
      $or: [
        {
          _id: {
            $nin: [
              ...user.friends,
              id,
              ...user.sendInvite,
              ...user.invitedFriends,
            ],
          },
        },
      ],
    })
      .limit(4)
      .select("_id avatar name");
    res.json(isNotFriend);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

module.exports = {
  changePassword,
  getUserByName,
  getUserById,
  sendFriendInvitation,
  acceptFriend,
  deleteFriend,
  deleteSendFriend,
  deleteInvitedFriend,
  getAllFriend,
  getAllSendFriend,
  getAllInvitedFriends,
  getUserIsNotFriend,
};
