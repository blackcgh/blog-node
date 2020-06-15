const { mongoose, BlogModel } = require('../db/mongodb/blog')
const { getAvatar } = require('./user')

const getAll = async (page, category) => {
  const obj = {}
  if(category) obj.category = category;
  const total = await BlogModel.countDocuments(obj);
  let data = await BlogModel.aggregate([
    {
      $match: obj
    },
    {
      $sort: {'_id': -1}
    },
    {
      $skip: page * 5
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'comment',
        localField: '_id',
        foreignField: 'bid',
        as: 'commentInfo'
      }
    }
  ])
  data = await getBlogAvatar(data);
  const isEnd = page * 5 + data.length >= total;
  return {data, isEnd}
}

const getUserList = uid => {
  return BlogModel.find({ uid }, 'title content createTime readNum').sort({'_id': -1})
}

const getCategoryList = category => {
  return BlogModel.find({ category }, 'title content createTime readNum').sort({'_id': -1}).limit(4)
}

const getList = async (uid) => {
  let data = await BlogModel.aggregate([
    {
      $match: { uid: mongoose.Types.ObjectId(uid), }
    },
    {
      $lookup: {
        from: 'comment',
        localField: '_id',
        foreignField: 'bid',
        as: 'commentInfo'
      }
    }
  ])
  return getBlogAvatar(data.reverse())
}

const getDetail = async (bid, uid) => {
  // 阅读数自增1
  BlogModel.updateOne({'_id': bid}, { $inc: { readNum: 1 }}).then(data => {});
  let data = await BlogModel.aggregate([
    {
      $match: { '_id': mongoose.Types.ObjectId(bid) }
    },
    {
      $lookup: {
        from: 'user',
        localField: 'uid',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $lookup: {
        from: 'comment',
        localField: '_id',
        foreignField: 'bid',
        as: 'commentInfo'
      }
    },
    {
      $lookup: {
        from: 'tag',
        localField: '_id',
        foreignField: 'bid',
        as: 'tagInfo'
      }
    }
  ])
  if(data.length == 0) return null;
  if(uid != '') {  // 验证用户对该博客是否点过赞、收藏
    data[0].isLike = data[0].likeId.includes(uid);
    data[0].isStar = data[0].starId.includes(uid);
  } else {
    data[0].isLike = false;
    data[0].isStar = false;
  }
  delete data[0].likeId;
  delete data[0].starId;
  if(data[0].commentInfo.length != 0) {
    data[0].commentInfo = await getBlogAvatar(data[0].commentInfo)
  }
  const { username, avatar, fan } = data[0].userInfo[0];
  data[0].author = username;
  data[0].avatar = avatar;
  data[0].fanNum = fan.length;
  delete data[0].userInfo;
  return data[0]
}

const newBlog = data => {
  const blog = new BlogModel(data);
  return blog.save()
}

const updateDtail = bid => {
  return BlogModel.aggregate([
    {
      $match: { '_id': mongoose.Types.ObjectId(bid) }
    },
    {
      $project: {
        title: 1,
        content: 1,
        category: 1
      }
    },
    {
      $lookup: {
        from: 'tag',
        localField: '_id',
        foreignField: 'bid',
        as: 'tagInfo'
      }
    }
  ])
}

const updateBlog = blog => {
  const { title, content, category } = blog;
  return BlogModel.updateOne({ '_id': blog['_id'] }, {
    title,
    content,
    category
  })
}

const delBlog = bid => {
  return BlogModel.deleteOne({ '_id': bid })
}

const likeBlog = async (bid, likeNum, likeId) => {
  const data = await BlogModel.findOne({ '_id': bid });
  let option = '';
  data.likeNum < likeNum ? option = '$push' : option = '$pull';
  return BlogModel.updateOne({ '_id': bid }, {
    likeNum,
    [option]: { likeId }
  })
}

const starBlog = async (bid, starNum, starId) => {
  const data = await BlogModel.findOne({ '_id': bid });
  let option = '';
  if(data.starNum < starNum) {
    option = '$push';
    data.starNum++
  } else {
    option = '$pull';
    data.starNum--
  }
  return BlogModel.updateOne({ '_id': bid }, {
    starNum: data.starNum,
    [option]: { starId }
  })
}

const getStarBlog = bids => {
  const ids = bids.map(el => {
    return { '_id': el }
  })
  return BlogModel.find({ $or: ids }).sort({'_id': -1})
}

const delAllStar = (bids, uid) => {
  const ids = bids.map(el => {
    return { '_id': el }
  })
  return BlogModel.update( { $or: ids }, {
      $inc: { starNum: -1 },
      $pull: { starId: uid }
    }
  )
}

const getMyDynamic = async (uid) => {
  let data = await BlogModel.aggregate([
    {
      $match: { uid: mongoose.Types.ObjectId(uid) }
    },
    {
      $lookup: {
        from: 'comment',
        localField: '_id',
        foreignField: 'bid',
        as: 'commentInfo'
      }
    }
  ])
  return getBlogAvatar(data.reverse())
}

const getDynamic = async (uids) => {
  let obj = {};
  if(uids[0] != '') { // 登录
    obj['$or'] = uids.map(el => {
      return { uid: mongoose.Types.ObjectId(el) }
    })
  }
  let data = await BlogModel.aggregate([
    {
      $match: obj
    },
    {
      $lookup: {
        from: 'comment',
        localField: '_id',
        foreignField: 'bid',
        as: 'commentInfo'
      }
    }
  ])
  return getBlogAvatar(data.reverse())
}

const getHeadImgRe = () => {
  return BlogModel.find({ headImg: { $nin: '' } }, 'title headImg').sort({'_id': -1}).limit(5)
}

const getBlogRecommend = () => {
  return BlogModel.aggregate([
    {
      $project: {
        title: 1,
        readNum: 1,
        likeNum: 1,
        starNum: 1
      }
    },
    {
      $lookup: {
        from: 'comment',
        localField: '_id',
        foreignField: 'bid',
        as: 'commentInfo'
      }
    }
  ]).then(data => {
    // 获取每条博客的评论数目
    for(let i of data) {
      i.commentInfo = i.commentInfo.length
    }
    data.forEach(el => {
      const n = el.readNum + el.likeNum * 10 + el.commentInfo * 20 + el.starNum * 30;
      el.num = n;
      delete el.readNum;
      delete el.likeNum;
      delete el.starNum;
      delete el.commentInfo
    })
    let temp;
    for(let i = 0; i < data.length - 1; i++){
      for(let j = i + 1; j < data.length; j++) {
        if(data[i].num < data[j].num) {
          temp = data[i];
          data[i] = data[j];
          data[j] = temp
        }
      }
    }
    data = data.slice(0, 10);
    return data
  })
}

const searchBlog = async (keyword) => {
  const reg = new RegExp(keyword, 'i');
  let data = await BlogModel.aggregate([
    {
      $match: { title: { $regex: reg } }
    },
    {
      $lookup: {
        from: 'comment',
        localField: '_id',
        foreignField: 'bid',
        as: 'commentInfo'
      }
    },
  ])
  return getBlogAvatar(data)
}

const getHistory = bids => {
  const promises = bids.map(el => BlogModel.findOne({'_id': el}, 'title content category uid').lean())
  return Promise.all(promises).then(data => {
    return getBlogAvatar(data)
  })
}

const saveHeadImg = (bid, headImg) => {
  return BlogModel.updateOne({ '_id': bid }, { headImg })
}

// 不导出
const getBlogAvatar = async (data) => {
  const uids = [], rids = [];
  for(let i of data) {
    uids.push({ '_id': i.uid });
    if(i.bid) {
      // 评论的被回复者id
      if(i.rid) {
        for(let j of data) {
          if(i.parentId.toString() == j['_id'].toString()) {
            if(i.rid.toString() == j.uid.toString()) {
              rids.push({ '_id': i.bid })   // 查找为空
            } else {
              rids.push({ '_id': i.rid })
            }
            break
          }
        }
      } else {
        rids.push({ '_id': i.bid })   // 查找为空
      }
    }
  }
  let data2 = await getAvatar(uids, rids);
  for(let i in data) {
    data[i].avatar = data2[i].avatar
    if(!data[i].bid) {
      data[i].author = data2[i].username    // 博客要author
    } else {
      data[i].sender = data2[i].username;   // 评论要回复者
      if(data2[i].receiver) data[i].receiver = data2[i].receiver;    // 回复评论要被回复者
    }
  }
  return data
}

module.exports = {
  getAll,
  getUserList,
  getCategoryList,
  getList,
  getDetail,
  newBlog,
  updateDtail,
  updateBlog,
  delBlog,
  likeBlog,
  starBlog,
  getStarBlog,
  delAllStar,
  getMyDynamic,
  getDynamic,
  getHeadImgRe,
  getBlogRecommend,
  searchBlog,
  getHistory,
  saveHeadImg
}
