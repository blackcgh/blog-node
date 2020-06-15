const mongoose = require('./db')

const BlogSchema = new mongoose.Schema({
  title: String,        // 标题
  content: String,      // 内容
  // author: String,       // 作者
  // avatar: String,       // 头像
  // sourceContent: String, // 原内容
  // markdownContent: String, // markdown内容
  createTime: Date,     // 创建时间
  category: String,     // 分类
  headImg: String,      // 头图
  // imgs: Array,          // 博客图片
  readNum: Number,      // 阅读人数
  likeNum: Number,      // 点赞人数
  likeId: Array,        // 点赞用户id
  starNum: Number,      // 收藏人数
  starId: Array,        // 收藏用户id
  uid: mongoose.Schema.Types.ObjectId, // 关联用户id
})

const BlogModel = mongoose.model('Blog', BlogSchema, 'blog');

module.exports = { mongoose, BlogModel };
