const CommentModel = require("../models/comment.Model");
const PostModel = require("../models/post.Model");
const createError = require("http-errors");
const { cloudinary } = require("../middlewares/cloudinary");
const { default: mongoose } = require("mongoose");

const commentPost = async (req, res, next) => {
  try {
    const { postid, text } = req.body;
    const postedBy = req.user.id;
    let data, image;
    if (req.file) {
      image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }
    data = { text, postedBy, image, post: postid };
    const post = await PostModel.findById(postid).populate(
      "author",
      "-password -refreshToken"
    );
    if (!post) {
      cloudinary.api.delete_resources(image.public_id);
      return next(createError.InternalServerError("Không tìm thấy bài viết!"));
    }
    const sess = await mongoose.startSession();
    sess.startTransaction();
    let newComment = await CommentModel.create(data);
    post.comments.push(newComment);
    await post.save({ session: sess });
    sess.commitTransaction();

    const comment = await CommentModel.find({ post: postid })
      .populate("postedBy", "-password -refreshToken")
      .populate("reply.postedBy", "-password -refreshToken")
      .sort({ createdAt: -1 });
    post.comments = comment;
    res.json(post);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const removeComment = async (req, res, next) => {
  try {
    const { postid, commentid } = req.params;
    const postedBy = req.user.id;
    const comment = await CommentModel.findById(commentid);
    if (!comment) {
      return next(
        createError.InternalServerError(
          "Có lỗi gì đó xảy ra, vui lòng thử lại sau ít phút!"
        )
      );
    }
    if (comment.postedBy.toString() !== postedBy) {
      return next(
        createError.InternalServerError("Bạn không thể xóa bình luận này!")
      );
    }
    const post = await PostModel.findById(postid).populate(
      "author",
      "-password -refreshToken"
    );
    if (!post) {
      return next(
        createError.InternalServerError(
          "Could not find post, please try again!"
        )
      );
    }
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await CommentModel.findByIdAndDelete(commentid);
    post.comments.pull(comment);
    await post.save({ session: sess });
    sess.commitTransaction();

    const comments = await CommentModel.find({ post: postid })
      .populate("postedBy", "-password -refreshToken")
      .populate("reply.postedBy", "-password -refreshToken")
      .sort({ createdAt: -1 });
    post.comments = comments;

    res.json(post);
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { commentid, text } = req.body;
    const { id } = req.user;
    let data, image;
    let comment = await CommentModel.findById(commentid);
    if (!comment) {
      return next(createError.NotFound("Bình luận không tồn tại!"));
    }
    if (comment.postedBy.toString() !== id) {
      return next(createError.InternalServerError("Bạn không có quyền này!"));
    }
    if (req.file) {
      cloudinary.api.delete_resources(comment.image.public_id);
      image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }
    data = { text, image };
    comment = await CommentModel.findByIdAndUpdate(commentid, data, {
      new: true,
    });
    res.json({
      message: "success",
      comment,
    });
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const likeComment = async (req, res, next) => {
  try {
    const { commentid } = req.params;
    const { id } = req.user;
    let comment = await CommentModel.findById(commentid);
    if (!comment) {
      return next(createError.NotFound("Bình luận không tồn tại!"));
    }
    comment = await CommentModel.findByIdAndUpdate(
      commentid,
      {
        $addToSet: { like: id },
      },
      { new: true }
    );
    console.log(comment);
    res.json(comment);
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const removeLikeComment = async (req, res, next) => {
  try {
    const { commentid } = req.params;
    const { id } = req.user;
    let comment = await CommentModel.findById(commentid);
    if (!comment) {
      return next(createError.NotFound("Bình luận không tồn tại!"));
    }
    comment = await CommentModel.findByIdAndUpdate(
      commentid,
      {
        $pull: { like: id },
      },
      { new: true }
    );
    res.json(comment);
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const replyComment = async (req, res, next) => {
  try {
    const { postid, commentid, text } = req.body;
    const { id } = req.user;
    let comment = await CommentModel.findById(commentid);
    if (!comment) {
      return next(createError.NotFound("Could not found comment!"));
    }
    let post = await PostModel.findById(postid);
    if (!post) {
      return next(createError.NotFound("Could not found post!"));
    }
    let image;

    if (req.file) {
      image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }
    comment = await CommentModel.findByIdAndUpdate(
      commentid,
      {
        $push: {
          reply: {
            text: text,
            postedBy: id,
            image: image,
          },
        },
      },
      { new: true }
    ).populate("reply.postedBy", "-password -refreshToken");
    res.json(comment);
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const updateReplyComment = async (req, res, next) => {
  try {
    const { commentid, replyid, text } = req.body;
    const comment = await CommentModel.findById(commentid)
      .populate("postedBy", "-password -refreshToken")
      .populate("reply.postedBy", "-password -refreshToken");
    if (!comment) {
      return next(createError.NotFound("Could not found comment!"));
    }
    let { reply } = comment;
    let index = -1;
    reply.forEach((v, k) => {
      if (v.id === replyid) {
        index = k;
      }
    });
    if (text) {
      reply[index].text = text;
    }
    let image;
    if (req.file) {
      image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
      reply[index].image = image;
    }
    await comment.save();
    return res.status(200).json({ reply });
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const removeReplyComment = async (req, res, next) => {
  try {
    const { commentid, replyid } = req.params;
    let comment = await CommentModel.findById(commentid)
      .populate("postedBy", "-password -refreshToken")
      .populate("reply.postedBy", "-password -refreshToken");
    if (!comment) {
      return next(createError.NotFound("Could not found comment!"));
    }
    let { reply } = comment;
    let index = reply.findIndex((v) => v.id === replyid);
    if (index === -1) {
      return next(createError.NotFound("Could not found reply!"));
    }
    reply.splice(index, 1);
    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const likeReplyComment = async (req, res, next) => {
  try {
    const { commentid, replyid } = req.params;
    const { id } = req.user;
    const comment = await CommentModel.findById(commentid)
      .populate("postedBy", "-password -refreshToken")
      .populate("reply.postedBy", "-password -refreshToken");
    if (!comment) {
      return next(createError.NotFound("Could not found comment!"));
    }
    let { reply } = comment;
    let index = -1;
    reply.forEach((v, k) => {
      if (v.id === replyid) {
        index = k;
      }
    });
    reply[index].like.push(id);
    await comment.save();
    res.json(comment);
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const removelikeReplyComment = async (req, res, next) => {
  try {
    const { commentid, replyid } = req.params;
    const { id } = req.user;
    const comment = await CommentModel.findById(commentid)
      .populate("postedBy", "-password -refreshToken")
      .populate("reply.postedBy", "-password -refreshToken");
    if (!comment) {
      return next(createError.NotFound("Could not found comment!"));
    }
    let { reply } = comment;
    let index = -1;
    reply.forEach((v, k) => {
      if (v.id === replyid) {
        index = k;
      }
    });
    reply[index].like.pull(id);
    await comment.save();
    res.json(comment);
  } catch (error) {
    console.log(error);
    next(
      createError.InternalServerError(
        "Some thing went wrong, please try again!"
      )
    );
  }
};

const getAllComment = async (req, res, next) => {
  try {
    const { postid } = req.params;
    const comments = await CommentModel.find({ post: postid })
      .populate("postedBy", "-password -refreshToken")
      .populate("reply.postedBy", "-password -refreshToken")
      .sort({ createdAt: -1 });
    if (!comments) {
      return next(createError.NotFound("Could not find post!"));
    }
    const post = await PostModel.findById(postid).populate(
      "author",
      "-password -refreshToken"
    );
    post.comments = comments;
    res.json(post);
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

module.exports = {
  commentPost,
  removeComment,
  updateComment,
  likeComment,
  removeLikeComment,
  replyComment,
  updateReplyComment,
  removeReplyComment,
  likeReplyComment,
  removelikeReplyComment,
  getAllComment,
};
