const mongoose = require('./db')

const WhisperSchema = new mongoose.Schema({
  sid: mongoose.Schema.Types.ObjectId,   // 发送人id
  rid: mongoose.Schema.Types.ObjectId,   // 接收人id
  time: Date,       // 发送时间
  content: String,  // 发送内容
})

const WhisperModel = mongoose.model('Whisper', WhisperSchema, 'whisper');

module.exports = WhisperModel
