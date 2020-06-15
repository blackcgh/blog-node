function formatUser(data) {
  if(data) {
    for (let i of data.star) {
      i.favorite.reverse()
    }
    for (let i of data.follow) {
      i.group.reverse()
    }
    data.fan.reverse();
  }
  return data
}

module.exports = { formatUser }
