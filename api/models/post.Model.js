const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = Schema(
  {
    image: {
      type: Schema.Types.Array,
    },
    imageid: {
      type: Schema.Types.Array,
    },
    body: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const PostModel = mongoose.model("Post", PostSchema);
module.exports = PostModel;
