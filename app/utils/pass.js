const crypto = require('crypto')
/**
 * 取一段随机数作为 salt,默认 3 位
 * @param start
 * @param end
 * @returns {string}
 */
const getRandomSalt = (start = 2, end = 5) => {
  return Math.random().toString().slice(start, end)
}
/**
 * 密码加盐
 * @param password
 * @param salt
 */
const cryptoPwd = (password, salt) => {
  let saltPass = password + salt || getRandomSalt()
  const md5 = crypto.createHash('sha256')
  return md5.update(saltPass).digest('hex')
}
module.exports = {
  getRandomSalt,
  cryptoPwd
}
