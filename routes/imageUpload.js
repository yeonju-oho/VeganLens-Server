const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// 디렉토리 확인 및 생성 함수
function ensureUploadsDirExists() {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true }); // 폴더가 없으면 생성
    }
}

// Multer 저장소 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        ensureUploadsDirExists();  // uploads 폴더 확인 및 생성
        cb(null, path.join(__dirname, 'uploads'));  // 절대 경로로 수정
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // 파일명 설정
    }
});

const upload = multer({ storage: storage });

// 이미지 업로드 라우트
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('파일이 업로드되지 않았습니다.');
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl: imageUrl });
});

// 이미지 삭제 라우트
router.delete('/delete-image', (req, res) => {
    const imageUrl = req.query.imageUrl;  // 전체 이미지 URL을 query parameter로 받음

    if (!imageUrl) {
        return res.status(400).send('이미지 URL이 제공되지 않았습니다.');
    }

    // 이미지 URL에서 파일명 추출
    const urlParts = imageUrl.split('/');  // URL을 '/' 기준으로 분할
    const imageName = urlParts[urlParts.length - 1];  // 마지막 부분이 파일명

    if (!imageName) {
        return res.status(400).send('파일명 추출에 실패했습니다.');
    }

    const imagePath = path.join(__dirname, 'uploads', imageName);

    // 파일이 존재하는지 확인하고, 삭제
    fs.exists(imagePath, (exists) => {
        if (!exists) {
            return res.status(404).send('파일을 찾을 수 없습니다.');
        }

        // 파일 삭제
        fs.unlink(imagePath, (err) => {
            if (err) {
                return res.status(500).send('파일 삭제 중 오류가 발생했습니다.');
            }
            res.json({ success: true, message: '파일이 삭제되었습니다.' });
        });
    });
});

module.exports = router;
