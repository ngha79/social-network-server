const express = require("express");
const {
  createPost,
  deletePost,
  getPostById,
  updatePost,
  likePost,
  unlikePost,
  getAllPost,
  getPostByUserId,
} = require("../controllers/PostController");
const checkAuth = require("../middlewares/checkAuth");
const { uploadCloud } = require("../middlewares/cloudinary");
const route = express.Router();

route.use(checkAuth);
route.get("/post/:postid", getPostById);
route.get("/:userId/posts", getPostByUserId);
route.post("/createPost", uploadCloud.array("image"), createPost);
route.put("/post/update/:postid", uploadCloud.array("image"), updatePost);
route.delete("/deletePost/:postid", deletePost);
route.put("/likepost/:postid", likePost);
route.put("/unlikepost/:postid", unlikePost);
route.get("/getAllPost", getAllPost);

module.exports = route;
