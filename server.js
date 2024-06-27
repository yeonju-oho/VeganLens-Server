// server.js
const express = require('express');
const bodyParser = require('body-parser');
const nicknameRouter = require('./routes/nickname');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api', nicknameRouter); // '/api' 경로에 nicknameRouter를 연결

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
