const mongoose = require('./db')

const UserSchema = new mongoose.Schema({
  username: String,   // 用户名
  password: String,   // 密码
  // nickname: String,   // 昵称
  // phone: String,      // 手机号码
  avatar: String,     // 头像
  bgImg: String,      // 背景图
  sign: String,       // 签名
  sex: String,        // 性别
  birthday: String,   // 出生日期
  star: [             // 收藏
    {
      name: String,   // 收藏夹名称
      public: Boolean,// 是否公开，默认公开
      favorite: Array,// 收藏夹
    }
  ],
  follow: [           // 关注
    {
      name: String,   // 分组名称
      group: Array,   // 分组
    }
  ],
  fan: Array,         // 粉丝
  blog: Number,       // 博客数目
  dynamic: Number,    // 动态数目
  history: Array,     // 历史记录，记录博客_id,
  userSet: {          // 设置
    setList: Array,   // 隐私设置
    homeList: Array,  // 主页设置
    tagList: Array,   // 个性标签
  },
  notice: String,     // 主页公告
  reply: Object,      // 回复我的
  like: Object,       // 收到的赞
  system: Object,     // 系统通知
  whisper: Object,    // 我的消息
})

const UserModel = mongoose.model('User', UserSchema, 'user');

module.exports = { mongoose, UserModel };
