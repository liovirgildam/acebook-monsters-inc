const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  { message: String, comments: Array },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
