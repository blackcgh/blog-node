const { mongoose, UserModel } = require('../db/mongodb/user')
const { formatUser } = require('../common/util')

const register = (username, password) => {
  return UserModel.findOne({ username }).then(data => {
    if (!data) {
      const newUser = new UserModel({
        username,
        password,
        avatar: 'http://localhost/images/user/default.png',
        bgImg: 'http://localhost/images/user/defaultbgimg.webp',
        sign: '',
        sex: '保密',
        birthday: '',
        star: [{
          name: '默认收藏夹',
          public: true,
          favorite: []
        }],
        follow: [{
            name: '全部关注',
            group: []
          },
          {
            name: '特别关注',
            group: []
          }
        ],
        dynamic: 0,
        blog: 0,
        userSet: {
          setList: [
            {
              name: '我的关注',
              status: true
            },
            {
              name: '我的收藏',
              status: true
            }
          ],
          homeList: [
            {
              name: '我的博客',
              status: true
            },
            // {
            //   name: '我的收藏',
            //   status: true
            // },
            // {
            //   name: '我的相簿',
            //   status: true
            // },
            // {
            //   name: '我的音频',
            //   status: true
            // },
            // {
            //   name: '我的视频',
            //   status: true
            // }
          ],
          tagList: []
        },
        notice: '',
        reply: {
          read: 0,
          total: 0
        },
        like: {
          read: 0,
          total: 0
        },
        system: {
          read: 0,
          total: 1
        },
        whisper: {
          read: 0,
          total: 0
        }
      })
      return newUser.save()
    }
    return null
  }).then(data => {
    if(data) {
      let obj = {
        '_id': data['_id'],
        username: data.username,
        avatar: data.avatar,
        bgImg: data.bgImg,
        sign: data.sign,
        sex: data.sex,
        birthday: data.birthday,
        star: data.star,
        follow: data.follow,
        fan: data.fan,
        blog: data.blog,
        dynamic: data.dynamic,
        history: data.history,
        userSet: data.userSet,
        notice: data.notice,
        reply: data.reply,
        like: data.like,
        system: data.system,
        whisper: data.whisper,
      }
      return formatUser(obj)
    }
    return data
  })
}

const login = async (username, password) => {
  const data = await UserModel.findOne({ username, password },
    'username avatar bgImg sign sex birthday star follow fan blog dynamic history userSet notice reply like system whisper').lean();
  return formatUser(data)
}

const validate = async (username) => {
  const data = await UserModel.findOne({ username },
    'username avatar bgImg sign sex birthday star follow fan blog dynamic history userSet notice reply like system whisper').lean();
  return formatUser(data)
}

const addFavorite = (uid, favorite) => {
  return UserModel.findOneAndUpdate({ '_id': uid }, { $push: { star: favorite } }, {
    new: true,
    fields: {
      '_id': 0,
      star: 1
    }
  })
}

const delFavorite = (uid, fid) => {
  return UserModel.updateOne({ '_id': uid }, {
    $pull: {
      star: { '_id': mongoose.Types.ObjectId(fid) }
    }
  })
}

const updateFavorite = (fid, favorite) => {
  return UserModel.updateOne({ 'star._id': fid }, {
    $set: {
      'star.$.name': favorite.name,
      'star.$.public': favorite.p
    }
  })
}

const addStar = async (fid, ofid, bid) => {
  const data = await UserModel.updateOne({ 'star._id': fid }, {
    $addToSet: { "star.$.favorite": bid }
  })
  if (ofid != '' && data.nModified) {
    const data2 = await UserModel.updateOne({ 'star._id': ofid }, {
      $pull: { "star.$.favorite": bid }
    })
    return data2
  }
  return data
}

const delStar = (fid, bid) => {
  return UserModel.updateOne({ 'star._id': fid }, {
    $pull: { "star.$.favorite": bid }
  })
}

const formatFav = async (bid) => {
  const data = await UserModel.find({ 'star.favorite': bid}, 'star');
  const arr = [];
  for(let i of data) {
    for(let j of i.star) {
      if(j.favorite.includes(bid)) {
        arr.push(UserModel.updateOne({ 'star._id': j['_id'] }, {
          $pull: { "star.$.favorite": bid }
        }))
      }
    }
  }
  if(arr.length) {
    Promise.all(arr)
  }
}

const addFollow = async (mid, fid, hid) => {
  await UserModel.updateOne({ 'follow._id': fid }, {
    $addToSet: { 'follow.$.group': hid }
  })
  return UserModel.updateOne({ '_id': hid }, {
    $addToSet: { 'fan': mid }
  })
}

const getFollow = hids => {
  const promises = hids.map(el => UserModel.findOne({ '_id': el }, 'username avatar sign'))
  return Promise.all(promises)
}

const changeFollow = async (did, aid, fid) => {
  await UserModel.updateOne({ 'follow._id': did }, {
    $pull: { 'follow.$.group': fid }
  })
  return UserModel.updateOne({ 'follow._id': aid }, {
    $addToSet: { 'follow.$.group': fid }
  })
}

const cancelFollow = async (mid, fid, hid) => {
  await UserModel.updateOne({ 'follow._id': fid }, {
    $pull: { 'follow.$.group': hid }
  })
  return UserModel.updateOne({ '_id': hid }, { $pull: { 'fan': mid } })
}

const updateBlogNum = (uid, b) => {
  let n;
  b ? n = 1 : n = -1; // b为true时自增
  return UserModel.updateOne({ '_id': uid }, { $inc: { blog: n } })
}

const updateDynamic = (uid, b) => {
  let n;
  b ? n = 1 : n = -1; // b为true时自增
  return UserModel.updateOne( {'_id': uid }, { $inc: { dynamic: n } })
}

const getUserRecommend = async (uid) => {
  let arr = [], obj = {};
  if(uid) {   // 已登录
    const data = await UserModel.findOne({ '_id': uid }, 'follow');
    arr.push(data['_id'].toString());
    for(let i of data.follow) {
      arr.push(...i.group)
    }
  }
  if(arr.length) {
    obj = { '_id': { $nin: arr } }
  }
  const data2 = await UserModel.find(obj).sort({ 'fan': -1 }).limit(5);
  return data2
}

const searchUser = async (keyword) => {
  const reg = new RegExp(keyword, 'i');
  const data = await UserModel.aggregate([{
      $match: {
        username: { $regex: reg }
      }
    },
    {
      $project: {
        username: 1,
        avatar: 1,
        sign: 1,
        fan: 1
      }
    },
    {
      $lookup: {
        from: 'blog',
        localField: '_id',
        foreignField: 'uid',
        as: 'blogInfo'
      }
    },
  ])
  for (let i of data) {
    i.blogInfo = i.blogInfo.length
  }
  for (let i of data) {
    i.fan = i.fan.length
  }
  return data
}

const updateHistory = async (uid, bid) => {
  await UserModel.updateOne({ '_id': uid }, { $pull: { history: { bid } } });
  return UserModel.updateOne({ '_id': uid }, {
    $push: {
      history: {
        bid,
        readTime: new Date()
      }
    }
  })
}

const emptyHistory = uid => {
  return UserModel.updateOne({ '_id': uid }, { history: [] })
}

const delHistory = (uid, bid) => {
  return UserModel.updateOne({ '_id': uid }, { $pull: { history: { bid } } })
}

const updateSet = (uid, userSet) => {
  return UserModel.updateOne({ '_id': uid }, { userSet })
}

const updateSign = (uid, sign) => {
  return UserModel.updateOne({ '_id': uid }, { sign })
}

const updateNotice = (uid, notice) => {
  return UserModel.updateOne({ '_id': uid }, { notice })
}

const getUserData = uid => {
  return UserModel.findOne({ '_id': uid }, 'username avatar bgImg sign star follow fan userSet notice')
}

const saveUserInfo = async (userInfo) => {
  const data = await UserModel.findOne({ username: userInfo.username });
  if(data) {
    if(data['_id'] ==  userInfo.uid) { // 不改名，改其他信息
      await UserModel.updateOne({ '_id': userInfo.uid }, userInfo);
      return true
    } else {    // 改名，重复
      return null
    }
  } else {      // 改名，没有重复
    await UserModel.updateOne({ '_id': userInfo.uid }, userInfo);
    return true
  }
}

const updateAvatar = (uid, avatar) => {
  return UserModel.updateOne({ '_id': uid }, { avatar })
}

const updateBgImg = (uid, bgImg) => {
  return UserModel.updateOne({ '_id': uid }, { bgImg })
}

const incrementMes = (uid, type) => {
  type = type + '.total';
  return UserModel.updateOne({ '_id': uid }, { $inc: { [type]: 1 } })
}

const decrementMes = (uid, type) => {
  type = type + '.total';
  return UserModel.updateOne({ '_id': uid }, { $inc: { [type]: -1 } })
}

const updateMes = (uid, type, total) => {
  type = type + '.read';
  return UserModel.updateOne({ '_id': uid }, { [type]: total })
}

const getAvatar = async (uids, rids) => {
  const promises = uids.map(el => UserModel.findOne(el, 'username avatar').lean());
  const data = await Promise.all(promises);
  if(rids && rids.length) {     // 评论
    const promises2 = rids.map(el => UserModel.findOne(el, 'username'));
    const data2 = await Promise.all(promises2);
    for(let i in data2) {
      if(data2[i] && data2[i].username) data[i].receiver = data2[i].username
    }
  }
  return data
}

module.exports = {
  register,
  login,
  validate,
  addFavorite,
  delFavorite,
  updateFavorite,
  addStar,
  delStar,
  formatFav,
  addFollow,
  getFollow,
  changeFollow,
  cancelFollow,
  updateBlogNum,
  updateDynamic,
  getUserRecommend,
  searchUser,
  updateHistory,
  emptyHistory,
  delHistory,
  updateSet,
  updateSign,
  updateNotice,
  getUserData,
  saveUserInfo,
  updateAvatar,
  updateBgImg,
  incrementMes,
  decrementMes,
  updateMes,
  getAvatar
}
