const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    name: {
      type: String,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: {
      type: String,
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["Message", "Group"],
      default: "Message",
    },
  },
  { timestamps: true }
);

const ChatModel = mongoose.model("Chat", ChatSchema);

module.exports = ChatModel;
