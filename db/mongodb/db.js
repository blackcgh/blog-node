const mongoose = require('mongoose')
const { MONGODB_CONF } = require('../../config/db')

mongoose.connect(MONGODB_CONF, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

module.exports = mongoose;
