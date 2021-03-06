## Unreleased

* 升级 [html-inject-assets-webpack-plugin](https://github.com/lijialiang/html-inject-assets-webpack-plugin) 可 inline 本地项目 src 文件夹下 CSS 或者 JS 文件
* 增加 `webpack { dev.htmlInject }` 字段可在开发工作流上对 html 进入资源注入
* 增加 支持 `.worker.js` 脚本文件（[详细](https://legoflow.com/wiki/#worker-%E8%84%9A%E6%9C%AC%E6%96%87%E4%BB%B6-%EF%BC%88v2-7-0-%EF%BC%89)）
* 修复 Win10 个别机器编译 `ansi-regex`、`strip-ansi` 问题

## 1.10.0 (01-09, 2019)

* 增加 `user.args` 可配置开发以及构建工作流下的用户参数
* 修复 localhost 等本地 IP 访问不了的问题
* 优化 获取本地机器 IP 方法，加快开发工作流启动速度
* 增加 默认 Babel 编译命名空间为 `@yy` NPM 模块
* 增加 默认 Vue 编译命名空间为 `@yy` NPM 模块
* 修复 多环境个别配置依赖失效问题

## 1.9.1 (12-07, 2018)

* 增加 `webpack { bundle.worker }` 配置项，可打包依赖的 WebWork 脚本（[详细](https://legoflow.com/wiki/config.html#bundle-worker-v2-5-0)）
* 增加 SVGA 文件依赖处理，例如
  ```js
  import { Downloader, Parser, Player } from 'svga.lite'
  import a from './a.svga'

  const downloader = new Downloader()
  const parser = new Parser()
  const player = new Player('#svga')

  const fileData = await downloader.get(a)
  const svgaData = await parser.do(fileData)

  await player.mount(svgaData)

  player.start()
  ```
* 更新依赖
  * TypeScript
  * Eslint
  * Postcss

## 1.8.0 (11-22, 2018)

* 增加 `webpack { dev.https }` [配置项](https://legoflow.com/wiki/config.html#dev-https-v2-4-0)
* 增加 `webpack { build.htmlInject }` [配置项](https://legoflow.com/wiki/config.html#build-htmlinject-v2-4-0)
* 增加 `webpack { build.copy }` [配置项](https://legoflow.com/wiki/config.html#build-copy-v2-4-0)

## 1.7.0 (11-13, 2018)

* 增加 Webpack model 雪碧图功能
* 修复 cache hash 影响开发工作流问题

## 1.6.0 (11-07, 2018)

* 修改 配置 includeModules 默认加入本地 `node_modules`
* 修改 配置 limitResourcesSize 默认值为 `5`
* 修改 配置 alias 加入默认值 `@ === ./src`
* 修改 配置 VueChunkStyle 默认值为 `false`
* 修改 配置 ES.Next 默认值为 `true`
* 修改 配置 workflow.dev { hot.reload } 默认值为 `true`
* 修改 配置 workflow.build { cache } 默认值为 `hash`

## 1.5.0 (11-02, 2018)

* 增加 默认 Babel 编译 [YY.PKG](https://github.com/yypkg/yypkg)
* 增加 默认别名指向本地 node_modules 模块
  * lodash
  * axios
  * moment

## 1.4.0 (10-22, 2018)

* 更新 依赖（[详细](https://github.com/legoflow/engine/commit/3697983fcb602bfaa8c5dbfeaa1594c8919c6232#diff-b9cfc7f2cdf78a7f4b91a753d10865a2)）
* 增加 `webpack { include: { vue } }` 配置
  * 通过该配置让 Webpack include 一些处于 node_modules 下，但同样需要 Vue-loader 编译的源码模块
* 删除 非 `js || jsx || ts || tsx` 文件的默认 exclude 配置
* 增加 `webpack { uglifyOptions }` [配置](https://github.com/webpack-contrib/uglifyjs-webpack-plugin#uglifyoptions)

## 1.2.0 (10-18, 2018)

* 增加 构建 DLL 文件，增加 Banner 信息
* 增加 `friendlyErrors` 配置，可关闭 Webpack Mode 下插件美化输出
* 更改 `webpack: { babelModules }` 默认值为 `commonjs`
* 修复 开发工作流个别情况下出现 `Shell.after not function` 问题

## 1.1.1 (10-08, 2018)

* 增加 `webpack: { babelModules }` 配置，可配置内置 [Babel/preset-env modules](https://babeljs.io/docs/en/babel-preset-env#modules)
  * 如果项目混合使用多种 export 多个规范 ([具体问题详情](https://github.com/webpack/webpack/issues/4039))

## 1.0.1 (09-25, 2018)

* 修复构建 dll 工作流缺少扩展通用配置问题

## 1.0.0 (09-06, 2018)

* 仅版本号修正

## 0.0.53 (09-05, 2018)

* 修复 JS 复合使用模块导出语法问题

## 0.0.52 (09-05, 2018)

* 升级 Babel@7.0.0
* 修复 Yarn 安装方式下开发工作流浏览器兼容性问题

## 0.0.50 (08-09, 2018)

* 修复 SVG inline 别名无效问题
  * 重写 **[markup-inline-loader](https://github.com/legoflow-override/markup-inline-loader)**，使用 Webpack 4 loader api - this.resolve 处理引入路径解析
* 增加 **开发**工作流在 4.x 以及 IE 9+ 等浏览器上的兼容性
  * 该部分浏览器均不支持 ES6，而依赖模块中存在 ES6 语法，导致兼容问题。筛选其中依赖 ES6 语法的原生 node_modules 模块加入 Babel 编译从而解决问题。

## 0.0.49 (08-03, 2018)

* 增加 通过 **webpack { sass.globalResources }** 配置全局作用域的 Sass 文件
* 修复 TS eslint 检测兼容问题
* 修复 Yarn 安装方式，构建项目 Babel $export is not a function 问题

## 0.0.48 (07-26, 2018)

* 优化 override 重写模块逻辑，适配 Yarn 安装方式

## 0.0.47 (07-20, 2018)

* 修复 引用 node_modules 模块构建打包后重复包裹 **default** 问题
* 升级 Webpack v4.16.1
* 升级 Babel v7.0.0-beta.54
* 升级 Postcss & loader，支持外部配置文件 ([Demo](https://github.com/legoflow/awesomes/tree/master/%E4%BD%BF%E7%94%A8%E8%87%AA%E5%AE%9A%E4%B9%89%20Postcss%20%E9%85%8D%E7%BD%AE))
* 抛弃 使用 Bebel-preset-es2015
* 增加 **webpack { include: { esnext } }** 配置 ([详细了解](https://legoflow.com/wiki/config.html#webpack))
  * 通过该配置让 Webpack include 一些处于 node_modules 下，但同样需要 ESNext 编译的源码模块

## 0.0.45 (07-09, 2018)

* 增加 Webpack mode 构建 JS SourceMap
* 增加 **webpack { VueChunkStyle }** 配置，使用该配置可让 vue 文件内含样式不独立打包出 Css 文件
  * 发现 Chunk 模块独立打包出的 Css，在 Android 4.3 版本下无法通过 linkElement.onload 触发回调，导致 Chunk 模块未能进入回调，导致异步路由页面空白。[问题详情](https://github.com/webpack-contrib/mini-css-extract-plugin/pull/134) & [linkElement.onload 兼容性](http://pie.gd/test/script-link-events/)

## 0.0.44 (07-06, 2018)

* 优化 获取空闲端口逻辑
* 增加 WebpackBar 显示进度
* 更新 Webpack 构建工作流 stats 信息输出方式
* 增加 支持 **postcss-preset-env**
* 增加 Happypack 构建 Webpack mode JS 文件

## 0.0.43 (07-03, 2018)

* 升级 Webpack 版本 v4.14.0
* 升级 Babel 7 版本 v7.0.0-beta.51
* 增加 Webpack mode 自动压缩图片文件

## 0.0.42 (06-27, 2018)

* 修复 `build:dll` webpack mode 设置问题
* 增加 暴露构建时间到 `process.build_time`

## 0.0.39 (06-22, 2018)

* 修复 构建直接 import Sass 后编译的 Css 引用错误 img 路径问题
* 修复 shellFunc 无 after 生命周期错误问题

## 0.0.38 (06-20, 2018)

* 修复 ESLint 重复提示错误问题
* 增加 构建进度输出
* 增加 开发工作流 Webpack Mode 插入小工具脚本支持

## 0.0.37 (06-19, 2018)

* 增加 默认开发工作流 **webpack-dev-server.disableHostCheck: true**

## 0.0.36 (06-15, 2018)

* 修改 启动调用方式
* 修复 banner 时间错误
* 修复 开发工作流 Chrome 打开端口 `0` 错误
* 增加 Webpack Mode 生成 dll 文件

## 0.0.33 (06-14, 2018)

* exclude local node_modules
* disable fork-ts to show errors in browser
* 支持 Shell 生命周期 **before** 修改 Webpack.options

## 0.0.32 (06-11, 2018)

* 支持 webpack mode
* 支持 自定义 entry
* 兼容 vue file `lang="html"`
* 增加 ESLint 检测 TS & .vue file

## 0.0.31 (06-07, 2018)

* Webpack 若构建失败停止构建，抛出错误

## 0.0.30 (06-04, 2018)

* 重大更新 vue-loader v15
* 增加 html & vue template inline svg
* 增加 ESLint 默认规范 [Standard](https://standardjs.com/rules-zhcn.html)
* 升级 Webpack v4.10.2
* 升级 Babel v7.0.0-beta.49
* 升级 Typescript v2.9.1

## 0.0.28 (05-30, 2018)

* 修复 HTML bundle 无效问题
* 支持 shell 生命周期 **init & before & after**

## 0.0.25 (05-22, 2018)

* 增加 **FriendlyErrors**
* 增加 **ESLint** 支持

## 0.0.24 (05-22, 2018)

* 升级 Webpack v4.8.3
* 升级 Webpack-dev-server v3.1.4，修复[热更新问题](https://github.com/vuejs-templates/webpack/issues/910)
* 支持 **workflow.dev { hot.reload }**

## 0.0.23 (05-14, 2018)

* 支持 开发工作流使用 shell

## 0.0.22 (05-09, 2018)

* 修复 util 问题
* 修复 Sass 文件修改热刷新问题

## 0.0.20 (05-09, 2018)

* 修复 **user.args** 通用注入
* 增加 默认别名 **@tpl/helper**
* 修改 **workflow.build { bundle.limitImgSize }** 为 **workflow.build { bunlde.limitResourcesSize }**
* 增加 **includeModules**

## 0.0.19 (05-04, 2018)

* 提供 params_config_schema.js
* 修复 **workflow.build { publicPath }** 缺失问题

## 0.0.18 (05-03, 2018)

* 修复 构建工作流 cache 个别问题
* 增加 **workflow.build { css.resourcesDomain }** 替换 css 引入资源相对路径转为绝对路径

## 0.0.17 (04-27, 2018)

* 清除 gulp-sass 依赖的 node-sass 版本

## 0.0.13 (04-27, 2018)

* 增加 **workflow.dev { proxy }**
* 升级 Webpack v4.6.0
* 优化 打印 LOG 信息

## 0.0.12 (04-26, 2018)

* 修复 Windows 兼容性问题

## 0.0.11 (04-26, 2018)

* 更新依赖

## 0.0.10 (04-26, 2018)

* 升级 Babel 7 beta.46

## 0.0.9 (04-24, 2018)

* 修复 Windows 兼容性问题
