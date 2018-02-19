const moment = require('moment')
// 格式化时间
exports.formatTime = time => moment(time).format('YYYY-MM-DD hh:mm:ss')
// 处理成功响应
exports.success = ({ctx, res = null, msg = '^V^'}) => {
  ctx.body = {
    code: 0,
    data: res,
    msg
  }
  ctx.status = 200
}
// 处理失败响应
exports.fail = ({ctx, res = null, code = -1, status = 200}) => {
  ctx.body = {
    code: code,
    data: res
  }
  ctx.status = status
}

