const mongoose = require('./db')

const QuestionSchema = new mongoose.Schema({
  uid: mongoose.Schema.Types.ObjectId,    // 用户id
  username: String,   // 用户
  question: String,   // 问题
  resolve: Boolean,   // 是否解决
})

const QuestionModel = mongoose.model('Question', QuestionSchema, 'question');

module.exports = QuestionModel
