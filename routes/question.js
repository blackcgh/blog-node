const express = require('express')
const { sendQuestion } = require('../controller/question')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const router = express.Router();

// $route POST api/question/aid
// @desc 问题反馈
router.post('/aid', (req, res, next) => {
  const { uid, username, question } = req.body;
  sendQuestion(uid, username, question).then(data => {
    if(data) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

module.exports = router
