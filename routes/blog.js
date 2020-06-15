const express = require('express')
const formidable = require('formidable')
const fs = require('fs')
const {
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
  getHistory,
  saveHeadImg
} = require('../controller/blog')
const {
  getUserRecommend,
  updateHistory,
  updateDynamic,
  updateBlogNum,
  formatFav
} = require('../controller/user')
const { newTag, updateTag, delTag } = require('../controller/tag')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const loginCheck = require('../middleware/loginCheck')

const router = express.Router();

// $route GET api/blog/all
// @desc  首页获取最新5条博客(json格式)
router.get('/all', async (req, res, next) => {
  const { page, category, flag, uid } = req.query;
  const all = await getAll(parseInt(page), category);
  if(flag) {  // 请求首页数据
    const headImg = await getHeadImgRe();
    const blog = await getBlogRecommend();
    const user = await getUserRecommend(uid);
    res.json(new SuccessModel({all, headImg, blog, user}))
  } else {    // 下一页博客推荐
    res.json(new SuccessModel(all));
  }
})

// $route GET api/blog/bloglist
// @desc  获取用户的其他博客
router.get('/bloglist', async (req, res, next) => {
  const { uid, c } = req.query;
  let user = await getUserList(uid);
  let category = await getCategoryList(c);
  let readCount = 0;
  for (let i of user) {
    readCount += i.readNum;
  }
    user = user.slice(0, 4);
    res.json(new SuccessModel({ readCount, user, category }));
})

// $route GET api/blog/list
// @desc  获取该用户所有博客
router.get('/list', (req, res, next) => {
  getList(req.query.uid).then(data => {
    if (data) {
      res.json(new SuccessModel(data));
    } else {
      res.json(new ErrorModel());
    }
  })
})

// $route GET api/blog/detail
// @desc  获取博客详情
router.get('/detail', async (req, res, next) => {
  const { bid, uid} = req.query;
  const data = await getDetail(bid, uid);
  if (data) {
    // 登录后才记录历史
    if(req.session.username) {
      await updateHistory(uid, bid)
    }
    res.json(new SuccessModel(data));
  } else {
    res.json(new ErrorModel());
  }
})

// $route POST api/blog/new
// @desc  新建博客、标签，用户博客、动态加1
router.post('/new', loginCheck, async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = './public/images/';
  form.parse(req, async (err, fields, files) => {
    let blog = JSON.parse(fields.blog);
    let tag = JSON.parse(fields.tag);
    blog.headImg = '';
    // if(blog.imgs.length == 0) blog.imgs.push('http://localhost/images/blog/blogimg.webp');
    const blogInfo = await newBlog(blog);
    if(tag.length != 0) { // 新建标签
      const tagList = tag.map(item => {
        return {
          content: item,
          bid: blogInfo['_id']
        }
      })
      await newTag(tagList);
    }
    await updateBlogNum(blogInfo.uid, true);
    await updateDynamic(blogInfo.uid, true);

    if(files.headimg) {
      // 创建用户目录
      const exist = fs.existsSync('./public/images/blog/' + blogInfo['_id']);
      if(!exist) fs.mkdirSync('./public/images/blog/' + blogInfo['_id']);
      // 新存储路径
      const path = './public/images/blog/' + blogInfo['_id'] + '/headimg';
      // 访问路径
      const headimg = 'http://localhost/images/blog/' + blogInfo['_id'] + '/headimg';
      fs.rename(files.headimg.path, path, async function (err) {
        if (err) console.log(err);
        const data = await saveHeadImg(blogInfo['_id'], headimg);
        if(data.ok) {
          res.json(new SuccessModel('上传成功'))
        } else {
          res.json(new ErrorModel('上传失败'))
        }
      })
    } else {
      res.json(new SuccessModel('创建成功'))
    }
  })
})

// $route Post api/blog/detail
// @desc  获取更新前的博客详情
router.post('/detail', (req, res, next) => {
  const result = updateDtail(req.body.bid);
  result.then(data => {
    if (data) {
      res.json(new SuccessModel(data));
    } else {
      res.json(new ErrorModel());
    }
  })
})

// $route POST api/blog/update
// @desc  更新博客
router.post('/update', loginCheck, async (req, res, next) => {
  const data = await updateBlog(req.body.blog);
  if (data.nModified) {
    let newTag = [];
    const bid = req.body.blog['_id'];
    req.body.tag.forEach(item => {
      newTag.push({
        content: item,
        bid
      })
    })
    const data2 = await updateTag(bid, newTag);
    if(data2) {
      res.json(new SuccessModel());
      return
    }
    res.json(new ErrorModel())
  } else {
    res.json(new ErrorModel())
  }
})

// $route POST api/blog/del
// @desc  删除博客、标签，用户博客减1、动态减1
router.post('/del', loginCheck, async (req, res, next) => {
  const { bid, uid } = req.body;
  const data = await delBlog(bid);
  if(data.deletedCount) {
    await delTag(bid);
    await updateBlogNum(uid);
    await updateDynamic(uid);
    await formatFav(bid);
    res.json(new SuccessModel())
  } else {
    res.json(new ErrorModel())
  }
})

// $route POST api/blog/like
// @desc  点赞博客
router.post('/like', loginCheck, (req, res, next) => {
  const { bid, likeNum, likeId } = req.body;
  likeBlog(bid, likeNum, likeId).then(data => {
    if (data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route POST api/blog/star
// @desc  收藏博客
router.post('/star', loginCheck, (req, res, next) => {
  const { bid, starNum, starId } = req.body;
  starBlog(bid, starNum, starId).then(data => {
    if (data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route GET api/blog/starblog
// @desc  获取收藏博客
router.get('/starblog', (req, res, next) => {
  getStarBlog(req.query.bids).then(data => {
    res.json(new SuccessModel(data));
  })
})

// $route POST api/blog/allstar
// @desc  删除所有收藏博客
router.post('/allstar', loginCheck, (req, res, next) => {
  const { bids, uid } = req.body;
  delAllStar(bids, uid).then(data => {
    if (data.nModified) {
      res.json(new SuccessModel())
    } else {
      res.json(new ErrorModel())
    }
  })
})

// $route GET api/blog/mydynamic
// @desc  获取我的动态
router.get('/mydynamic', (req, res , next) => {
  getMyDynamic(req.query.uid).then(data => {
    res.json(new SuccessModel(data))
  })
})

// $route GET api/blog/dynamic
// @desc  获取动态
router.get('/dynamic', (req, res, next) => {
  getDynamic(req.query.uids).then(data => {
    res.json(new SuccessModel(data))
  })
})

// $route GET api/blog/historylist
// @desc  获取历史记录
router.get('/historylist', loginCheck, (req, res, next) => {
  getHistory(req.query.bids).then(data => {
    res.json(new SuccessModel(data))
  })
})

// $route POST api/blog/img
// @desc  保存博客图片
router.post('/img', (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = './public/images/blog/';
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if(err) console.log(err);
    // 访问路径
    const imgUrl = 'http://localhost/images/blog/' + files.blogImg.path.substr(19);
    res.json(new SuccessModel(imgUrl))
  })
})

module.exports = router;
