let MONGODB_CONF;// 连接 mongodb 数据库配置
let REDIS_CONF;// 连接 redis 数据库配置

MONGODB_CONF = 'mongodb://127.0.0.1:27017/myblog';
REDIS_CONF = {
  port: 6379,
  host: '127.0.0.1'
}

module.exports = {
  MONGODB_CONF,
  REDIS_CONF
}
