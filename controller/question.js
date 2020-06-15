const QuestionModel = require('../db/mongodb/question')

const sendQuestion = (uid, username, question) => {
  return QuestionModel.create({
    uid,
    username,
    question,
    resolve: false
  })
}

module.exports = {
  sendQuestion
}
