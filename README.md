<h1 align="center"> Engine </h1>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img alt="Licence" src="https://img.shields.io/badge/license-MIT-green.svg" />
  </a>
  <a href="">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-green.svg" />
  </a>
</p>

<p align="center">
    <strong>工作流核心引擎模块</strong>
</p>

## 作用

导出 **开发** 以及 **构建** 工作流的调用方法提供给 APP 以及 CLI 等上层工具

## 更新日志

**[CHANGELOG](./CHANGELOG.md)**

## 安装

```
npm i legoflow-engine --save
```

## 使用

```js
// messager 工作流消息输出机制
// dev 启动 开发 的异步函数
// build 启动 构建 的异步函数
const messager = require('legoflow-engine/messager');
const dev = require('legoflow-engine/dev');
const build = require('legoflow-engine/build');

dev( Config );
```

调用需要的 [参数配置](https://legoflow.com/wiki/config.html)

## 许可

[MIT](./LICENSE)
