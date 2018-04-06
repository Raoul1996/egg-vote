# egg-vote
[![Build Status](https://travis-ci.org/Raoul1996/egg-vote.svg?branch=master)](https://travis-ci.org/Raoul1996/egg-vote)
[![codecov](https://codecov.io/gh/Raoul1996/egg-vote/branch/master/graph/badge.svg)](https://codecov.io/gh/Raoul1996/egg-vote)
[![bitHound Overall Score](https://www.bithound.io/github/Raoul1996/egg-vote/badges/score.svg)](https://www.bithound.io/github/Raoul1996/egg-vote)
[![bitHound Dependencies](https://www.bithound.io/github/Raoul1996/egg-vote/badges/dependencies.svg)](https://www.bithound.io/github/Raoul1996/egg-vote/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/Raoul1996/egg-vote/badges/devDependencies.svg)](https://www.bithound.io/github/Raoul1996/egg-vote/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/Raoul1996/egg-vote/badges/code.svg)](https://www.bithound.io/github/Raoul1996/egg-vote)
[![Maintainability](https://api.codeclimate.com/v1/badges/8d31fa28164dc4a47fce/maintainability)](https://codeclimate.com/github/Raoul1996/egg-vote/maintainability)

> koa-vote 使用 egg 重构版本

## 接口文档
- [POSTMAN](https://documenter.getpostman.com/view/3083800/egg-vote/RVfyAp5B)

## 开发日志
### 20180216 初一
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
### 20180219 初四
- login register 接口重构

### 20180220 初五
- 熟悉框架基本完成
- 完成 jwt 部分，并使用 jwt 记录用户 id，详见 `/user` 路由
- 完成图形验证码部分，使用 ccap 并结合 session 进行使用
- 使用 redis 拓展 session，但是目前只有 captcha 部分使用到了 session，所以没有绝对的必要使用 redis， 仅仅只是为了学习
- 完成文件上传功能，并返回静态文件地址

### 20180221 初六
- 多个文件上传功能完成，并按照用户 id 进行独立存储
- 多文件上传至七牛并返回外链地址
- 删除本地public下的文件，并自定义异常处理中间件

### 20180222 初七
- 密码忘记于重置接口
- 删除文件并进行数据库同步记录
- 获取七牛提供的文件信息

### 20180223 初八
- 发送验证邮件并激活
- 向 [egg-mail](https://github.com/zhouzhi3859/egg-mail) plugin 发 pr
- [package.json](package.json) 中指定从 github 拉取 egg-mail 依赖

### 20180224 初九
- 封装 [egg-captcha](https://github.com/raoul1996/egg-captcha) 插件
- 封装 [egg-qiniu-upload](https://github.com/raoul1996/egg-qiniu-upload) 插件

### 20180225 初十
- 创建投票相关接口
- 获取投票列表，删除投票

### 20180226 十一
- 创建投票，提交投票

### 20180227 十二
- 创建 xlsx 解析功能
- 封装 [egg-xlsx](https://github.com/Raoul1996/egg-xlsx.git) plugin

### 20180304 - 20180305
- 忙活开学的一堆事情
- 向 [egg-cors](https://github.com/eggjs/egg-cors.git) 提交 [PR](https://github.com/eggjs/egg-cors/pull/10)
- egg-cors 跨域问题解决方案(不携带 cookie)：
    ```js
    // {app_root}/config/plugin.js
    exports.cors = {
      enable: true,
      package: 'egg-cors',
    };
    ```
    ```js
    // {app_root}/config/config.default.js
    exports.cors = {}
    exports.security = {
      domainWhiteList: [ 'http://localhost:8080' ]
    };
    ```
- egg-cors 跨域问题解决方案(在使用 session 的时候需要携带 cookie)
    ```js
    // {app_root}/config/plugin.js
    exports.cors = {
      enable: true,
      package: 'egg-cors',
    };
    ```
    ```js
    // {app_root}/config/config.default.js
      exports.cors = {
        credentials: true
      }
    exports.security = {
      csrf: {
          enable: false
        },
      domainWhiteList: [ 'http://localhost:8080' ]
    };
    ```
### 20180406
- 开始增加单元测试，已经测试完成 `/user` `/login` `/register` `/forget` `/update` 控制器的测试

### 20180407

- `UserController` 测试覆盖率 `100%`
- 测试 `VoteController`

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org