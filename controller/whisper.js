const WhisperModel = require('../db/mongodb/whisper')

const getWhisper = (sid, rid) => {
  return WhisperModel.find({
    $or: [
      { sid, rid },
      {
        sid: rid,
        rid: sid
      }
    ]
  })
}

const newWhisper = whisper => {
  return WhisperModel.create(whisper)
}

module.exports = {
  getWhisper,
  newWhisper
}
