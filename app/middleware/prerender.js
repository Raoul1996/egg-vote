const isbot = require('is-bot')
module.exports = () => {
    const reg = /googlebot|bingbot|baiduspider|linkedinbot|slackbot|Applebot|360spider|Sosospider|YoudaoBot|Sogou web spider|curl|postman/i
    return async function (ctx, next) {
        const ua = ctx.header['user-agent']
        if (isbot(ua) && !ua.match(reg)) {
            ctx.status = 206
        } else {
            await next(ctx)
        }
    }
}