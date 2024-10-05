// models/Diary.js
const mongoose = require('../db');
const Schema = mongoose.Schema;
const User = require('./User_models');  // User 모델 참조

const diarySchema = new Schema({
  username: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // User 모델의 ObjectId 참조
  title: { type: String, required: true },  // 일기 제목
  content: { type: String, required: true },  // 일기 내용
  images: [{ type: String }],  // 이미지 최대 5개 URL 배열로 저장
  publishedAt: { type: Date, default: Date.now },  // 게시일
  likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],  // 좋아요 수
  isPublic: { type: Boolean, default: true }  // 공개/비공개 정보
}); 


const Diary = mongoose.model('Diary', diarySchema);

module.exports = Diary;
