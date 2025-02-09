const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Community Post Model
const postSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'fitgenie_user', required: true },
  content: { type: String, required: true },
  userType: { type: String, required: true },
  email: { type: String, required: true },
  images: [{ type: String }], // Optional images
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'fitgenie_user' }], // Users who liked this post
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityComment' }],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('CommunityPost', postSchema);

// Community Comment Model (Supports Nested Replies)
const commentSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'fitgenie_user', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost', required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityComment', default: null }, // For nested comments
  content: { type: String, required: true },
  userType: { type: String, required: true },
  email: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'fitgenie_user' }],
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityComment' }], // Nested comments
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('CommunityComment', commentSchema);

module.exports = { Post, Comment };
