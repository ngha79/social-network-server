const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    avatar: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    dateOfBirth: {
      type: Date,
      default: new Date("2000-01-01"),
    },
    refreshToken: {
      type: String,
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const hash = await bcrypt.hash(this.password, 8);
  this.password = hash;
});

UserSchema.methods.isComparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resettoken;
};

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
