const mongoose = require('./db')

const CommentSchema = new mongoose.Schema({
  content: String, // 评论内容
  createTime: Date, // 创建时间
  likeNum: Number, // 点赞数
  likeId: Array, // 点赞用户id
  // replyNum: Number, // 回复数
  // state: Number, // 评论状态， 0是不可见，1是可见
  // grade: Number, // 评论等级，0是顶级评论，1是回复评论
  parentId: mongoose.Schema.Types.ObjectId, // 值为博客id是顶级评论，为评论id是回复评论
  // sender: String,  // 发送人
  // avatar: String,  // 发送人头像
  // receiver: String, // 接收人，有值说明是回复评论的评论
  uid: mongoose.Schema.Types.ObjectId, // 回复者id
  rid: mongoose.Schema.Types.ObjectId, // 被回复者id
  bid: mongoose.Schema.Types.ObjectId, // 关联博客id
})

const CommentModel = mongoose.model('Comment', CommentSchema, 'comment');





module.exports = { mongoose, CommentModel };
