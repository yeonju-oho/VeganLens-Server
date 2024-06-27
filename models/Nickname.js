// models/Nickname.js
const mongoose = require('../db');

const nicknameSchema = new mongoose.Schema({
  nickname: { 
    type: String, 
    unique: true, 
    required: true 
  },
});

const Nickname = mongoose.model('Nickname', nicknameSchema);

module.exports = Nickname;
