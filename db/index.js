// db/index.js

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nicknameDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = mongoose;
