const Service = require('egg').Service

class FileService extends Service {
  async avatar() {
    return 'yes'
  }
}

module.exports = FileService