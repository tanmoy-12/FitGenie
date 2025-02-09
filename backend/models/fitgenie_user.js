const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  exercise: { type: String, required: true },
  duration: { type: Number, required: true },
  coins: { type: Number, default: 10, immutable: true }, // Set default value to 10 and make it immutable
  createdAt: { type: Date, default: Date.now }
});


const userSchema = new Schema({
  userName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  userType: { type: String },
  otp: { type: String },
  verificationType: { type: String, default: null }, // 'google' for Google users
  wishlist: [{ type: String }],
  // Health Data
  exerciseData: [exerciseSchema], // Array of exercise data objects
  logs: [{ type: String }],
  // Community Features
  communityPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost' }], // User's posts
  likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost' }], // Liked posts
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CommunityComment' }] // Comments
});

module.exports = mongoose.model('fitgenie_user', userSchema);
