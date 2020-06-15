const express = require('express')
const { newComment, likeComment } = require('../controller/comment')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

const router = express.Router();

// $route POST api/comment/new
// @desc  创建博客评论
router.post('/new', loginCheck, async (req, res, next) => {
  const data = await newComment(req.body);
  if(data) {
    res.json(new SuccessModel(data))
  } else {
    res.json(new ErrorModel())
  }
})

// $route POST api/comment/like
// @desc  点赞、取消点赞等更新评论操作
router.post('/like', loginCheck, (req, res, next) => {
  const { cid, likeNum, likeId } = req.body;
  const result = likeComment(cid, likeNum, likeId);
  result.then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

module.exports = router;
