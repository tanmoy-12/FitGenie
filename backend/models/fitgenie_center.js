//User model for users
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  centerHeadEmail: { type: String, required: true, unique: true },
  centerName: { type: String },
  centerType: { type: String},//AC or Non-AC
  details: { type: String },
  registrationNumber: { type: String },
  address: { type: String },
  state: { type: String },
  city: { type: String },
  pincode: { type: String },
  images: [{ type: String }],//Image Links
  videos: [{ type: String }],
  centerRating: { type: Number },
  centerStatus: { type: String }, //active or inactive
  contactNumber: { type: String },
  trainerCount: { type: String },
  availableInstruments: [{ type: String }],
  openingTime: { type: String },
  closingTime: { type: String },
  daysAvailable: [{ type: String }],
  reviews: [{ String }],
  latitude: { type: String },
  longitude: { type: String },
  isVerified: { type: Boolean, default: false },
  isRegistered: { type: Boolean, default: false }
});

module.exports = mongoose.model('Center', userSchema);