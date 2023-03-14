const createError = require("http-errors");
const PostModel = require("../models/post.Model");
const { default: mongoose } = require("mongoose");
const UserModel = require("../models/user.Model");
const CommentModel = require("../models/comment.Model");
const cloudinary = require("cloudinary").v2;

const getPostById = async (req, res, next) => {
  const { postid } = req.params;
  try {
    const post = await PostModel.findById(postid)
      .populate("author", "-password -refreshToken")
      .populate("likes", "-password -refreshToken")
      .populate("comments", "-password -refreshToken");
    if (!post) return next(createError.InternalServerError("Server error!"));
    res.json({ post });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getPostByUserId = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const posts = await PostModel.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "-password -refreshToken")
      .populate("likes", "-password -refreshToken")
      .populate("comments", "-password -refreshToken");
    if (!posts) return next(createError.InternalServerError("Server error!"));
    res.json({ posts });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const createPost = async (req, res, next) => {
  let imageUrl = [];
  let imageId = [];
  let { body } = req;
  console.log(req.files);
  if (req.files) {
    req.files.map((image) => {
      imageUrl.push(image.path);
      imageId.push(image.filename);
    });
    req = {
      ...req,
      body: {
        ...body,
        image: imageUrl,
        imageid: imageId,
        author: req.user.id,
      },
    };
  }
  let createPost = new PostModel(req.body);
  let user;
  try {
    user = await UserModel.findById(req.user.id).select(
      "-password -refreshToken"
    );
  } catch (error) {
    return next(
      createError.InternalServerError(
        "Có lỗi gì đó đã xảy ra vui lòng thử lại sau ít phút!"
      )
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createPost.save({ session: sess });
    user.post.push(createPost);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    cloudinary.api.delete_resources(imageid);
    return next(
      createError.InternalServerError(
        "Có lỗi gì đó đã xảy ra vui lòng thử lại sau ít phút!"
      )
    );
  }
  res.status(200).json({
    post: (
      await createPost.populate("author", "-password -refreshToken")
    ).toObject(),
  });
};

const updatePost = async (req, res, next) => {
  try {
    const { postid } = req.params;
    const { userid } = req.user;
    const author = await PostModel.findById(postid).populate(
      "author",
      "-password -refreshToken"
    );
    const authorid = author.author.id;
    if (userid !== authorid)
      return next(
        createError.InternalServerError(
          "Bạn không được cho phép để làm điều này!"
        )
      );
    let imageUrl = [];
    let imageId = [];
    let { body } = req;
    if (req.files) {
      req.files.map((image) => {
        imageUrl.push(image.path);
        imageId.push(image.filename);
      });
      req = { ...req, body: { ...body, image: imageUrl, imageid: imageId } };
    }

    const update = await PostModel.findByIdAndUpdate(postid, req.body);
    return res.json({
      status: "success",
      data: update,
    });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const deletePost = async (req, res, next) => {
  const { postid } = req.params;
  try {
    const post = await PostModel.findById(postid).populate("author");
    if (!post) {
      return next(createError.NotFound("Không tìm thấy bài viết."));
    }
    if (post.author.id !== req.user.userid) {
      return next(
        createError.Unauthorized("Bạn không được cho phép để làm điều này!")
      );
    }

    cloudinary.api.delete_resources(post.imageid);

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await post.remove({ session: sess });
    post.author.post.pull(postid);
    await post.author.save();
    await CommentModel.deleteMany({ post: postid });
    await sess.commitTransaction();
    res.status(200).json({
      message: "Delete post success.",
    });
  } catch (error) {
    next(createError.InternalServerError(error));
  }
};

const likePost = async (req, res, next) => {
  try {
    const { postid } = req.params;
    const post = await PostModel.findByIdAndUpdate(
      postid,
      {
        $addToSet: { likes: req.user.userid },
      },
      { new: true }
    );
    res.json({ message: "Like success.", post });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const unlikePost = async (req, res, next) => {
  try {
    const { postid } = req.params;
    const post = await PostModel.findByIdAndUpdate(
      postid,
      {
        $pull: { likes: req.user.userid },
      },
      { new: true }
    );
    res.json({ message: "Unlike success.", post });
  } catch (error) {
    next(createError.InternalServerError(error.message));
  }
};

const getAllPost = async (req, res, next) => {
  try {
    const { author } = req.body;
    const allPost = await PostModel.find({ id: author });
    if (!allPost) {
      return res.json("Bạn không có bài viết nào.");
    }
    return res.json(allPost);
  } catch (error) {
    console.log(error);
    next(createError.InternalServerError(error));
  }
};

module.exports = {
  getPostByUserId,
  createPost,
  deletePost,
  getPostById,
  updatePost,
  likePost,
  unlikePost,
  getAllPost,
};
