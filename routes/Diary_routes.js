// routes/diary.js
const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary_models');
const User = require('../models/User_models');

// 일기 생성 API
router.post('/add-diary', async (req, res) => {
    const { username, title, content, images, isPublic } = req.body;

    try {
        // 유저 존재 확인
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        const newDiary = new Diary({
            username: user._id,
            title,
            content,
            images: images ? images.slice(0, 5) : [],  // 최대 5개의 이미지만 저장
            isPublic
        });

        await newDiary.save();
        res.json({ success: true, message: '일기가 성공적으로 추가되었습니다.', diary: newDiary });
    } catch (error) {
        console.error('Error adding diary:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 모든 공개된 일기 조회 API
router.get('/public-diaries', async (req, res) => {
    try {
        const diaries = await Diary.find({ isPublic: true }).populate('username', 'username');
        res.json({ success: true, diaries });
    } catch (error) {
        console.error('Error fetching public diaries:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

router.get('/user-diaries/:username', async (req, res) => {
    const { username } = req.params;
    const { date } = req.query;

    try {
        // 유저 존재 확인
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        // 날짜 필터링 조건 설정 (하루 동안 작성된 일기 필터링)
        let dateFilter = {};
        if (date) {
            const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0)); // 시작일자 00:00:00
            const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999)); // 종료일자 23:59:59
            dateFilter = { $gte: startOfDay, $lte: endOfDay }; // 하루 필터링
        }

        // 조건에 맞는 일기 조회 (username과 createdAt 필터링 추가)
        const filter = { username };
        if (date) {
            filter.publishedAt = dateFilter;
        }

        const diaries = await Diary.find(filter).populate('username', 'username');

        res.json({ success: true, diaries });
    } catch (error) {
        console.error('Error fetching user diaries:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});


// 일기 수정 API
router.patch('/update-diary/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, images, isPublic } = req.body;

    try {
        const updatedDiary = await Diary.findByIdAndUpdate(
            id,
            { $set: { title, content, images: images ? images.slice(0, 5) : [], isPublic } },
            { new: true }
        );

        if (updatedDiary) {
            res.json({ success: true, message: '일기가 성공적으로 업데이트되었습니다.', diary: updatedDiary });
        } else {
            res.status(404).json({ success: false, message: '일기를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('Error updating diary:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 일기 삭제 API
router.delete('/delete-diary/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await Diary.findByIdAndDelete(id);
        if (result) {
            res.json({ success: true, message: '일기가 성공적으로 삭제되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '일기를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('Error deleting diary:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

router.patch('/like-diary/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const diary = await Diary.findById(id);

        if (!diary) {
            return res.status(404).json({ success: false, message: '일기를 찾을 수 없습니다.' });
        }

        // likes 배열이 존재하지 않으면 빈 배열로 초기화
        if (!diary.likes) {
            diary.likes = [];
        }

        // 유저가 이미 좋아요를 누르지 않았는지 확인
        if (!diary.likes.includes(userId)) {
            diary.likes.push(userId);  // 유저 ID를 좋아요 리스트에 추가
            await diary.save();

            res.json({ success: true, message: '좋아요가 추가되었습니다.', likesCount: diary.likes.length });
        } else {
            res.status(400).json({ success: false, message: '이미 좋아요를 누른 유저입니다.' });
        }
    } catch (error) {
        console.error('Error liking diary:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

router.patch('/unlike-diary/:id', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    try {
        const diary = await Diary.findById(id);

        if (!diary) {
            return res.status(404).json({ success: false, message: '일기를 찾을 수 없습니다.' });
        }

        // likes 배열이 undefined일 경우 빈 배열로 초기화
        if (!diary.likes) {
            diary.likes = [];
        }

        // 유저가 좋아요를 누른 상태인지 확인
        const userIndex = diary.likes.indexOf(userId);
        if (userIndex !== -1) {
            diary.likes.splice(userIndex, 1);  // 유저 ID를 좋아요 리스트에서 제거
            await diary.save();

            res.json({ success: true, message: '좋아요가 취소되었습니다.', likesCount: diary.likes.length });
        } else {
            res.status(400).json({ success: false, message: '좋아요를 누르지 않은 유저입니다.' });
        }
    } catch (error) {
        console.error('Error unliking diary:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});


module.exports = router;
