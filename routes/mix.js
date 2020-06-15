const express = require('express')
const { searchBlog } = require('../controller/blog')
const { searchUser } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')

const router = express.Router();

// $route GET api/search/list
// @desc 搜索博客、用户
router.get('/list', async (req, res, next) => {
  const keyword = req.query.keyword;
  console.log(req.query);

  const blogList = await searchBlog(keyword);
  const userList = await searchUser(keyword);
  res.json(new SuccessModel({blogList, userList}))
})

module.exports = router;
