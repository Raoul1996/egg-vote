const fs = require('fs')
const path = require('path')
const mkdirsSync = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname)
      return true
    }
  }
}
const removeFile = (filename) => {
  try {
    fs.unlinkSync(filename)
  } catch (e) {
    if (e.errno === -2) throw ({status: 404, message: "文件不存在"})
  }
  // fs.unlinkSync(filename)
}
module.exports = {
  mkdirsSync,
  removeFile
}