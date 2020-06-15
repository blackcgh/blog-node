const express = require('express')
const {
  getReply,
  delReply,
  getLike,
  getSystem,
  getWhisperUser,
  delWhisperUser,
  getMessage,
  saveMessage
} = require('../controller/message')
const { updateMes } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const router = express.Router();

// $route GET api/message/reply
// @desc 获取回复
router.get('/reply', async (req, res, next) => {
  const { uid, total } = req.query;
  const data = await getReply(uid);
  await updateMes(uid, 'reply', total);
  res.json(new SuccessModel(data))
})

// $route POST api/message/delreply
// @desc 删除某一条回复消息
router.post('/delreply', async (req, res, next) => {
  const { uid, replyId } = req.body;
  const data = await delReply(uid, replyId);
  if(data.nModified) {
    res.json(new SuccessModel())
  } else {
    res.json(new ErrorModel())
  }
})

// $route GET api/message/like
// @desc 获取点赞
router.get('/like', async (req, res, next) => {
  const { uid, total } = req.query;
  const data = await getLike(uid);
  await updateMes(uid, 'like', total);
  res.json(new SuccessModel(data))
})

// $route GET api/message/system
// @desc 获取系统消息
router.get('/system', async (req, res, next) => {
  const { uid, total } = req.query;
  const data = await getSystem(uid);
  await updateMes(uid, 'system', total);
  res.json(new SuccessModel(data))
})

// $route GET api/message/whisper
// @desc 获取我的消息
router.get('/whisper', async (req, res, next) => {
  const { uid, cid, total } = req.query;
  const data = await getWhisperUser(uid, cid);
  await updateMes(uid, 'whisper', total);
  res.json(new SuccessModel(data))
})

// $route POST api/message/delwhisper
// @desc 删除某一条用户记录
router.post('/delwhisper', async (req, res, next) => {
  const { uid, cid } = req.body;
  const data = await delWhisperUser(uid, cid);
  if(data.ok) {
    res.json(new SuccessModel())
  } else {
    res.json(new ErrorModel())
  }
})

// $route GET api/message/set
// @desc 获取消息设置
router.get('/set', async (req, res, next) => {
  const data = await getMessage(req.query.uid);
  res.json(new SuccessModel(data))
})

// $route POST api/message/save
// @desc 保存消息设置
router.post('/save', async (req, res, next) => {
  const { uid, messageSet } = req.body;
  await saveMessage(uid, messageSet);
  res.json(new SuccessModel())
})

module.exports = router
