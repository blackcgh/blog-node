const express = require('express')
const { getAll } = require('../controller/tag')
const { SuccessModel } = require('../model/resModel')

const router = express.Router();

// $route GET api/tag/all
// @desc  获取所有标签
// router.get('/all', (req, res, next) => {
//   const result = getAll();
//   result.then(data => {
//     res.json(new SuccessModel(data));
//   })
// })

module.exports = router;
