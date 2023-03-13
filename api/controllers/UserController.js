const createError = require("http-errors");
const { default: mongoose, isValidObjectId } = require("mongoose");
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
  const { name } = req.body;
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
    console.log(error);
    next(createError.InternalServerError(error.message));
  }
};

const getUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id).select("-password -refreshToken");
    if (!user) {
      next(createError.NotFound("Không tìm thấy người dùng!"));
    }
    res.json(user);
  } catch (error) {
    console.log(error);
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

    res.json({ user, friend });
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
    console.log(friend);
    if (!friend) {
      return next(createError.InternalServerError("Server error!"));
    }

    // start session
    const session = await mongoose.startSession();
    session.startTransaction();
    user.friends.addToSet(userAccept);
    user.invitedFriends.pull(userAccept);
    await user.save();
    friend.friends.addToSet(id);
    friend.sendInvite.pull(id);
    await friend.save();
    session.commitTransaction();
    session.endSession();
    //end session

    res.json({ user, friend });
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

    res.json({
      message: "Xóa kết bạn thành công.",
    });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deleteSendFriend = async (req, res, next) => {
  const { userReceiverId } = req.params;
  const { id } = req.user;
  try {
    const user = await UserModel.findById(id).select("-password -refreshToken");

    const userReceiver = await UserModel.findById(userReceiverId).select(
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
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Xóa lời gửi kết bạn thành công." });
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
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Xóa lời mời kết bạn thành công." });
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
      invitedFriends: { $in: [id] },
    }).select("-password -refreshToken");
    res.json(sendInvite);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getAllInvitedFriends = async (req, res, next) => {
  const { id } = req.user;
  try {
    const invitedFriends = await UserModel.find({
      sendInvite: { $in: [id] },
    }).select("-password -refreshToken");
    res.json(invitedFriends);
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
};
