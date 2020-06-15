const mongoose = require('./db')

const MessageSchema = new mongoose.Schema({
  uid: mongoose.Schema.Types.ObjectId, // 用户id
  reply: Array,     // 我的回复
  like: Array,      // 点赞我的
  system: Array,    // 系统通知
  whisper: Array,   // 我的消息
  messageSet: Array //  消息设置
})

const MessageModel = mongoose.model('Message', MessageSchema, 'message');

module.exports = {mongoose, MessageModel}
