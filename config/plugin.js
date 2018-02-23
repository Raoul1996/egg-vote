exports.static = true
exports.session = true
exports.cors = {
  enable: true,
  package: 'egg-cors'
}
exports.validate = {
  enable: true,
  package: 'egg-validate'
}
exports.mysql = {
  enable: true,
  package: 'egg-mysql'
}
exports.jwt = {
  enable: true,
  package: 'egg-jwt'
}
exports.passport = {
  enable: true,
  package: 'egg-passport'
}

exports.passportGithub = {
  enable: true,
  package: 'egg-passport-github'
}
exports.sessionRedis = {
  enable: false,
  package: 'egg-session-redis'
}

exports.redis = {
  enable: false,
  package: 'egg-redis'
}

exports.bizerror = {
  enable: false,
  package: 'egg-bizerror'
}
exports.email = {
  enable: true,
  package: 'egg-mail'
}