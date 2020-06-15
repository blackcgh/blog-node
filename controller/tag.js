const TagModel = require('../db/mongodb/tag')

const getAll = function() {
  return TagModel.find();
}

const newTag = function(tagList) {
  return TagModel.create(tagList);
}

const updateTag = function(bid, newTag) {
  return TagModel.deleteMany({ bid }).then(data => {
    if(newTag.length !== 0) {
      return TagModel.create(newTag);
    } else {
      return true;
    }
  })
}

const delTag = function(bid) {
  return TagModel.deleteMany({ bid });
}

module.exports = {
  getAll,
  newTag,
  updateTag,
  delTag
}
