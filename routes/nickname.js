// routes/nickname.js
const express = require('express');
const router = express.Router();
const Nickname = require('../models/Nickname');


// 닉네임 추가 API
router.post('/addNickname', async (req, res) => {
    const { nickname } = req.body;
  
    try {
      const newNickname = new Nickname({ nickname });
      await newNickname.save();
      res.json({ success: true, message: nickname + ' 닉네임이 성공적으로 추가되었습니다.' });
    } catch (error) {
      console.error('Error adding nickname:', error);
      res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 닉네임 삭제 API
router.delete('/deleteNickname', async (req, res) => {
    const { nickname } = req.body;

    try {
        const result = await Nickname.deleteOne({ nickname });
        if (result.deletedCount > 0) {
            res.json({ success: true, message: '닉네임이 성공적으로 삭제되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '해당 닉네임을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('Error deleting nickname:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 닉네임 중복 확인 API
router.post('/checkNickname', async (req, res) => {
  const { nickname } = req.body;

  try {
    const existingNickname = await Nickname.findOne({ nickname });
    if (existingNickname) {
      res.json({ exists: true, message: '이미 사용 중인 닉네임입니다.' });
    } else {
      res.json({ exists: false, message: '사용할 수 있는 닉네임입니다.' });
    }
  } catch (error) {
    console.error('Error checking nickname:', error);
    res.status(500).json({ error: '서버 오류 발생' });
  }
});

module.exports = router;
