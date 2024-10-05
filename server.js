// server.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const ip = '3.38.228.18';
const port = 3000;

app.use(bodyParser.json());

// 서버 실행시 루트 경로에서 간단한 메시지를 반환하도록 설정
app.get('/', (req, res) => {
  const ct = new Date().toLocaleString(); // 현재 시간을 로컬 시간대 문자열로 변환
  res.send(`This is \'Vegan Lens\' server.<br>Current time is: ${ct}`);
});

// ===== 이 밑에 라우터 추가하기 =====

const userRouter = require('./routes/User_routes');
const diaryRouter = require('./routes/Diary_routes');
const ingredientRoutes = require('./routes/ingredientRoutes');

app.use('/api', userRouter); // 
app.use('/api', ingredientRoutes);
app.use('/api', diaryRouter);






// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://${ip}:${port} 에서 실행 중입니다.`);
});
