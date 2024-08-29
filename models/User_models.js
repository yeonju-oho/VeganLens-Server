// models/User_models.js
const mongoose = require('../db');
const Schema = mongoose.Schema;
const { VeganReasons, VeganTypes } = require('../models/define');

const userSchema = new Schema({
  username: { type: String, unique: true, required: true },
  isAdmin: { type: Boolean, default: false },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  reason: { type: Number, required: true, enum: Object.values(VeganReasons) },  // 비건 이유
  veganType: { type: Number, default: VeganTypes.VEGAN, enum: Object.values(VeganTypes) },  // 비건 타입
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
