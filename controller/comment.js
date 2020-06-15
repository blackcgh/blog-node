const { CommentModel } = require('../db/mongodb/comment')
const { incrementMes, decrementMes } = require('./user')

const newComment = async (data) => {
  const replyComment = await CommentModel.create(data);
  if(replyComment.rid) {    // 回复评论
    const commentId = replyComment['_id'];
    const parentComment = await CommentModel.findOne({ '_id': replyComment.parentId }, 'content')
    const userComment = await CommentModel.findOne({
        parentId: parentComment['_id'],
        uid: replyComment.rid
      }, 'content')
    await require('./message').addReply(replyComment.rid, {
      commentId,
      parentComment,
      userComment,
      replyComment
    })
    await incrementMes(replyComment.rid, 'reply')
  }
  return replyComment
}

const likeComment = async (cid, likeNum, likeId) => {
  let option = '';
  const data = await CommentModel.findOne({ '_id': cid }, 'likeNum uid');
  if(data.likeNum < likeNum) {
    option = '$push';
    await incrementMes(data.uid, 'like');
  } else {
    option = '$pull';
    await decrementMes(data.uid, 'like');
  }
  await CommentModel.updateOne({'_id': cid}, {
    likeNum,
    [option]: { likeId }
  })
  return require('./message').updateLike(data.uid, option, { cid, likeId })
}

const getComment = cids => {
  const promises = cids.map(el => CommentModel.findOne(el, 'bid content'))
  return Promise.all(promises)
}

module.exports = {
  newComment,
  likeComment,
  getComment
}
