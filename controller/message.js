const {mongoose, MessageModel} = require('../db/mongodb/message')
const { getAvatar } = require('./user')
const { getWhisper } = require('./whisper')

const createMessage = (uid, username) => {
  const newMessage = new MessageModel({
    uid,
    reply: [],
    like: [],
    system: [
      {
        title: '欢迎你的到来！！！',
        time: new Date(),
        content: 'Hello！' + username + '，欢迎你成为我们中的一员，这里是一个有故事有想法的社区。在接下来的时间里，如果你遇到什么问题，欢迎你告诉我们，同时也希望你在这里过得愉快。',
        isLook: false
      }
    ],
    whisper: [],
    messageSet: [true, true, true, true, true]
  })
  return newMessage.save()
}

const addReply = (uid, obj) => {
  return MessageModel.updateOne({ uid }, { $push: { reply: obj } })
}

const getReply = async (uid) => {
  const data = await MessageModel.findOne({ uid }, 'reply');
  const uids = data.reply.map(el => {
    return { '_id': el.replyComment.uid }
  })
  const data2 = await getAvatar(uids);
  for(let i in data2) {
    data.reply[i].replyComment.avatar = data2[i].avatar;
    data.reply[i].replyComment.sender = data2[i].username
  }
  return data.reply.reverse()
}

const delReply = (uid, replyId) => {
  return MessageModel.updateOne({ uid },
    {
      $pull: {
        reply: { commentId: mongoose.Types.ObjectId(replyId) }
      }
    })
}

const updateLike = (uid, option, obj) => {
  if(option == '$push') obj.time = new Date();
  return MessageModel.updateOne({ uid }, { [option]: { like: obj } })
}

const getLike = async (uid) => {
  const data = await MessageModel.findOne({ uid }, 'like');
  let uids = [];
  let cids = [];
  data.like.forEach(el => {
    uids.push({ '_id': el.likeId });
    cids.push({ '_id': el.cid })
  })
  // 获取用户信息
  const data2 = await getAvatar(uids);
  // 获取评论信息
  const data3 = await require('./comment').getComment(cids);
  for(let i in data.like) {
    data.like[i].user = data2[i];
    data.like[i].comment = data3[i];
    delete data.like[i].likeId
  }
  return data.like
}

const getSystem = uid => {
  return MessageModel.findOne({ uid }, 'system')
}

const addWhisperUser = async (uid, cid) => {
  let data;
  for(let i = 0; i < 2; i++) {
    if(i == 1) {
      data = uid;
      uid = cid;
      cid = data;
    }
    await MessageModel.updateOne({ uid }, { $pull: { whisper: cid } });
    data = await MessageModel.updateOne({ uid }, {
      $push: {
        whisper: {
          $each: [cid],
          $position: 0
        }
      }
    })
  }
  return data
}

const getWhisperUser = async (uid, cid) => {
  const data = await MessageModel.findOne({ uid }, 'whisper');
  let rid;
  if(data.whisper.length) rid = data.whisper[0];
  if(cid) {    // 通过发消息按钮进入我的消息
    if(!data.whisper.includes(cid)) {
      data.whisper.unshift(cid)
    }
    rid = cid
  }
  if(data.whisper.length == 0) {
    return {
      userList: [],
      whisperList: []
    }
  }
  const cids = data.whisper.map(el => {
    return { '_id': el }
  })
  const data2 = await getAvatar(cids);
  const data3 = await getWhisper(uid, rid);
  return {
    userList: data2,
    whisperList: data3
  }
}

const delWhisperUser = (uid, cid) => {
  return MessageModel.updateOne({ uid }, { $pull: { whisper: cid } })
}

const getMessage = uid => {
  return MessageModel.findOne({ uid }, 'messageSet')
}

const saveMessage = (uid, messageSet) => {
  return MessageModel.updateOne({ uid }, { messageSet })
}

module.exports = {
  createMessage,
  addReply,
  getReply,
  delReply,
  updateLike,
  getLike,
  getSystem,
  addWhisperUser,
  getWhisperUser,
  delWhisperUser,
  getMessage,
  saveMessage
}
