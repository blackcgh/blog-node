const express = require('express')
const { getWhisper, newWhisper } = require('../controller/whisper')
const { addWhisperUser } = require('../controller/message')
const { incrementMes } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const router = express.Router();

// $route GET api/whisper/list
// @desc 获取朋友的聊天记录
router.get('/list', async (req, res, next) => {
  const { sid, rid } = req.query;
  const data = await getWhisper(sid, rid);
  res.json(new SuccessModel(data))
})

// $route GET api/whisper/new
// @desc 新建聊天
router.post('/new', async (req, res, next) => {
  const { sid, rid } = req.body;
  await newWhisper(req.body);
  await incrementMes(req.body.rid, 'whisper');
  const data = await addWhisperUser(sid, rid);
  if(data.nModified) {
    res.json(new SuccessModel())
  } else {
    res.json(new ErrorModel())
  }
})

module.exports = router
