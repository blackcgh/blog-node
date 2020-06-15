const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan'); // 日志

const blogRouter = require('./routes/blog') // router
const userRouter = require('./routes/user')
const commentRouter = require('./routes/comment')
const tagRouter = require('./routes/tag')
const mixRouter = require('./routes/mix')
const QuestionRouter = require('./routes/question')
const MessageRouter = require('./routes/message')
const WhisperRouter = require('./routes/whisper')

const session = require('express-session'); // cookie-session-redis
const RedisStore = require('connect-redis')(session);
const redisClient = require('./db/redis/redis')

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

const sessionStore = new RedisStore({
  client: redisClient
});
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'black_WHITE',
  cookie: {
    path: '/', // 默认配置
    httpOnly: true,

    maxAge: 24 * 60 * 60 * 1000
  },
  store: sessionStore
}))

// app.use((req, res, next) => {
//   res.set('Access-Control-Allow-Origin', 'http://localhost:8081');
//   res.set('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept');
//   res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

//   res.set('Set-Cookie', 'name=black;path=/;httpOnly')
//   next();
// })

// 静态资源
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/blog', blogRouter);
app.use('/api/user', userRouter);
app.use('/api/comment', commentRouter);
app.use('/api/tag', tagRouter);
app.use('/api/search', mixRouter);
app.use('/api/question', QuestionRouter);
app.use('/api/message', MessageRouter);
app.use('/api/whisper', WhisperRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
});

module.exports = app;
