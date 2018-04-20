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

导出 `开发` 以及 `构建` 工作流的调用方法提供给客户端以及 cli 等上层工具

## 安装

```
npm i legoflow-engine --save
```

## 使用

#### 开始之前，需要重写某些 node_modules 模块，例如：

```js
const path = require('path');
const override = require('legoflow-engine/override');

( async ( ) => {
    await override(
        // 项目 node_modules 的绝对路径
        path.resolve( __dirname, './node_modules' ),
        // 项目 node_modules_override 的绝对路径
        path.resolve( __dirname, './node_modules/legoflow-engine/node_modules_override' ),
        // 是否 debug 模式
        true,
    )
} )( );
```

#### 调用

```js
// messager 工作流消息输出机制
// dev 启动 开发 的异步函数
// build 启动 构建 的异步函数
const { messager, dev, build } = require('legoflow-engine');

dev( Config );
```

调用需要的 [参数配置](./params_config.md)

## 许可

[MIT](./LICENSE)
