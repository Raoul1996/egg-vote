# egg-vote

koa-vote 使用 egg 重构版本

## 接口文档
- [POSTMAN](https://documenter.getpostman.com/view/3083800/egg-vote/RVfyAp5B)

## 开发日志
### 20180216
- egg 跨域问题解决办法
    1. 在 [plugin.js](config/plugin.js) 中开启 `egg-cors` 插件
    2. 在 `config.${env}.js` 中配置白名单，注意域名不需要添加 http && https 前缀
    3. 有关跨域和同源策略的文章网上多的去了
- ~~egg-jwt 插件的初步使用~~
    1. 参考项目：[eggjs-demo](https://github.com/glh1991/eggjs-demo)
    2. 参考之前我做的 jwt 校验的项目 [koa-vote](https://github.com/Raoul1996/koa-vote.git)
    2. jwt 校验的基础知识和好处网上同样一大堆，这里可以贴一下之前我翻译的一篇文章：[[译] Angular 安全 —— 使用 JSON 网络令牌（JWT）的身份认证：完全指南](https://juejin.im/post/5a64267c518825734e3e5c22)，虽然是 Angular + Express，但是关于 JWT 的知识是通用的
    3. 在 [plugin.js](config/plugin.js) 中开启 `egg-jwt` 插件或者其它插件， egg 玩的人不是特别多，所以很多问题可以强迫自己通过看文档啥的自己解决，而且官方给的文档和 demo 都很用心，很棒
    4. 目前是自己在 middleware 中放了一个[中间件](middleware/auth.js)
    5. 尝试将 [auth](middleware/auth.js) 中间件放到 `config.${env}.js` 中，但是在中间件抛出异常之后会影响 vue-ssr 的正常进行，所以暂时没有全局应用，在后期的实现中会增加 match 和 ignore 的配置
    6. 将 jwt 解密之后的内容挂载到 `ctx.state.user` 上，方便对用户进行标识，思路源于 koa-jwt 的实现
    7. 一定不要使用 jwt 存放敏感信息，原因可以查看我翻译的文章
- 使用 egg-jwt 文档中指定的方式进行使用
### 20180219
- login register 接口重构

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org