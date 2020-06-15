const express = require('express')
const formidable = require('formidable')
const fs = require('fs')

const {
  register,
  login,
  validate,
  addFavorite,
  delFavorite,
  updateFavorite,
  addStar,
  delStar,
  addFollow,
  getFollow,
  changeFollow,
  cancelFollow,
  searchUser,
  emptyHistory,
  delHistory,
  updateSet,
  updateSign,
  updateNotice,
  getUserData,
  saveUserInfo,
  updateAvatar,
  updateBgImg
} = require('../controller/user')
const { createMessage, getMessage } = require('../controller/message')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

const router = express.Router();

// $route POST api/user/register
// @desc  注册
router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  const data = await register(username, password);
  if (data && data.username) {
    // 设置 session，存进 redis
    req.session.username = data.username;
    const data2 = await createMessage(data['_id'], data.username);
    data.messageSet = data2.messageSet;
    res.json(new SuccessModel(data))
  } else {
    res.json(new ErrorModel('注册失败'))
  }
})

// $route POST api/user/login
// @desc  登录
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  const data = await login(username, password);
  if (data && data.username) {
    // 设置 session，存进 redis
    req.session.username = data.username;
    const data2 = await getMessage(data['_id']);
    data.messageSet = data2.messageSet;
    res.json(new SuccessModel(data));
  } else {
    res.json(new ErrorModel('登录失败'));
  }

})

// $route POSt api/user/logout
// @desc  退出
router.post('/logout', (req, res,next) => {
  req.session.destroy(err => {
    if(err) {
      res.json(new ErrorModel('该用户没有登录'));
      return;
    }
    res.json(new SuccessModel('退出成功'))
  });
})

// $route GET api/user/validate
// @desc 验证是否登录
router.get('/validate', loginCheck, async (req, res, next) => {
  const data = await validate(req.session.username);
  if (data && data['_id']) {
    const data2 = await getMessage(data['_id']);
    data.messageSet = data2.messageSet;
    res.json(new SuccessModel(data));
  } else {
    res.json(new ErrorModel('验证失败'));
  }
})

// $route POST api/user/add
// @desc 添加新的收藏夹
router.post('/add', loginCheck, (req, res, next) => {
  const { uid, favorite } = req.body;
  addFavorite(uid, favorite).then(data => {
    if(data) {
      const lastData = data.star[data.star.length - 1];
      res.json(new SuccessModel(lastData))
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/del
// @desc 删除收藏夹
router.post('/del', loginCheck, (req, res, next) => {
  const { uid, fid } = req.body;
  delFavorite(uid, fid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/update
// @desc 修改收藏夹名称、隔开状态
router.post('/update', loginCheck, (req, res, next) => {
  const { fid, favorite} = req.body;
  updateFavorite(fid, favorite).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/addstar
// @desc 添加收藏
router.post('/addstar', loginCheck, (req, res, next) => {
  const { fid, ofid, bid } = req.body;
  addStar(fid, ofid, bid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/delstar
// @desc 删除收藏
router.post('/delstar', loginCheck, (req, res, next) => {
  const { fid, bid } = req.body;
  delStar(fid, bid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/follow
// @desc 添加关注
router.post('/follow', loginCheck, (req, res, next) => {
  const { mid, fid, hid } = req.body;
  addFollow(mid, fid, hid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route GET api/user/followlist
// @desc 获取关注列表
router.get('/followlist', (req, res, next) => {
  getFollow(req.query.hids).then(data => {
    if(data.length) {
      res.json(new SuccessModel(data))
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route GET api/user/changefollow
// @desc 改变关注分组
router.post('/changefollow', loginCheck, (req, res, next) => {
  const { did, aid, fid } = req.body;
  changeFollow(did, aid, fid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/cancelfollow
// @desc 取消关注
router.post('/cancelfollow', loginCheck, (req, res, next) => {
  const { mid, fid, hid } = req.body;
  cancelFollow(mid, fid, hid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route GET api/user/search
// @desc 搜索用户
router.get('/search', (req, res, next) => {
  searchUser(req.query.keyword).then(data => {
    res.json(new SuccessModel(data))
  })
})

// $route POST api/user/emptyhistory
// @desc 清空历史
router.post('/emptyhistory', loginCheck, (req, res, next) => {
  emptyHistory(req.body.uid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/delhistory
// @desc 删除某条历史记录
router.post('/delhistory', loginCheck, (req, res, next) => {
  const { uid, bid } = req.body;
  delHistory(uid, bid).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/updateset
// @desc 修改设置
router.post('/updateset', (req, res, next) => {
  const { uid, userSet } = req.body;
  updateSet(uid, userSet).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/updatesign
// @desc 更新签名
router.post('/updatesign', (req, res, next) => {
  const { uid, sign } = req.body;
  updateSign(uid, sign).then(data =>{
    if(data.ok) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/updatenotice
// @desc 更新公告
router.post('/updatenotice', (req, res, next) => {
  const { uid, notice } = req.body;
  updateNotice(uid ,notice).then(data => {
    if(data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route GET api/user/userdata
// @desc 获取他人数据
router.get('/userdata', (req, res, next) => {
  getUserData(req.query.uid).then(data => {
    if(data) {
      res.json(new SuccessModel(data))
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/info
// @desc 保存用户信息
router.post('/info', loginCheck, (req, res, next) => {
  saveUserInfo(req.body).then(data => {
    if(data) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/user/avatar
// @desc 更新头像
router.post('/avatar', loginCheck, async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = './public/images/';
  // form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    // 用户id
    const id = Object.keys(files)[0];
    // 创建用户目录
    const exist = fs.existsSync('./public/images/user/' + id);
    if(!exist) {
      fs.mkdirSync('./public/images/user/' + id);
    }
    // 新存储路径
    const path = './public/images/user/' + id + '/avatar';
    // 访问路径
    const avatar = 'http://localhost/images/user/' + id + '/avatar';
    fs.rename(files[id].path, path, async function (err) {
      if (err) console.log(err);
      const data = await updateAvatar(id, avatar);
      if(data.ok) {
        res.json(new SuccessModel('上传成功'))
      } else {
        res.json(new ErrorModel('上传失败'))
      }
    })
  })
})

// $route POST api/user/bgimg
// @desc 更新背景图
router.post('/bgimg', loginCheck, (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = './public/images/';
  // form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    // 用户id
    const id = Object.keys(files)[0];
    // 创建用户目录
    const exist = fs.existsSync('./public/images/user/' + id);
    if(!exist) {
      fs.mkdirSync('./public/images/user/' + id);
    }
    // 新存储路径
    const path = './public/images/user/' + id + '/bgimg';
    // 访问路径
    const bgImg = 'http://localhost/images/user/' + id + '/bgimg';
    fs.rename(files[id].path, path, async function (err) {
      if (err) console.log(err);
      const data = await updateBgImg(id, bgImg);
      if(data.ok) {
        res.json(new SuccessModel('上传成功'))
      } else {
        res.json(new ErrorModel('上传失败'))
      }
    })
  })
})

module.exports = router
