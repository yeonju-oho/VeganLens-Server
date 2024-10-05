const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();  // 라우터 인스턴스 생성
const app = express();  // 앱 인스턴스 생성

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
        cb(null, 'uploads/');
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

module.exports = router;
