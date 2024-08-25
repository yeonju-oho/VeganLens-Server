// db/index.js
const mongoose = require('mongoose');

// MongoDB Atlas 연결 문자열로 수정
const uri = "mongodb+srv://yeonjuoho:yjPJyZomRO6xAZud@vegenlens.lo4mt.mongodb.net/veganLens?retryWrites=true&w=majority";

// Mongoose를 사용하여 MongoDB Atlas에 연결
mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;
