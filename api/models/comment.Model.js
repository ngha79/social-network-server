const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    text: String,
    image: {
      url: String,
      public_id: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reply: [
      {
        text: String,
        image: {
          url: String,
          public_id: String,
        },
        created: {
          type: Date,
          default: Date.now,
        },
        postedBy: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        like: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      },
    ],
    like: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    post: { type: mongoose.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
