const mongoose = require('./db')

const TagSchema = new mongoose.Schema({
  content: String, // 标签内容
  bid: mongoose.Schema.Types.ObjectId, // 关联博客id
})

const TagModel = mongoose.model('Tag', TagSchema, 'tag');

module.exports = TagModel
