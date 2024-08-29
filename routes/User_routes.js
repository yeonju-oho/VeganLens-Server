// routes/nickname.js
const express = require('express');
const router = express.Router();
const User = require('../models/User_models');  // 모델 경로 수정
const { VeganReasons, VeganTypes } = require('../models/define');
// 사용자 추가 API
router.post('/add-user', async (req, res) => {
    const { username, isAdmin, profilePicture, bio, reason, veganType } = req.body;
  
    try {
      const newUser = new User({ username, isAdmin, profilePicture, bio, reason, veganType });
      await newUser.save();
      res.json({ success: true, message: `${username} 사용자가 성공적으로 추가되었습니다.` });
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 사용자 삭제 API
router.delete('/delete-user', async (req, res) => {
    const { username } = req.body;

    try {
        const result = await User.deleteOne({ username });
        if (result.deletedCount > 0) {
            res.json({ success: true, message: `${username} 사용자가 성공적으로 삭제되었습니다.` });
        } else {
            res.status(404).json({ success: false, message: '해당 사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 사용자 중복 확인 API
router.post('/check-user', async (req, res) => {
  const { username } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.json({ exists: true, message: `${username}은(는) 이미 사용 중인 사용자 이름입니다.` });
    } else {
      res.json({ exists: false, message: `${username}은(는) 사용할 수 있는 사용자 이름입니다.` });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

// 사용자 정보 업데이트 API
router.patch('/update-user/:username', async (req, res) => {
  const { username } = req.params;
  const { profilePicture, bio, reason, veganType } = req.body;

  try {
      const updatedUser = await User.findOneAndUpdate(
          { username: username },
          { $set: { profilePicture, bio, reason, veganType } },
          { new: true }  // 업데이트된 문서를 반환
      );

      if (updatedUser) {
          res.json({ success: true, message: '사용자 정보가 업데이트되었습니다.', user: updatedUser });
      } else {
          res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
      }
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: '서버 오류 발생' });
  }
});

module.exports = router;
