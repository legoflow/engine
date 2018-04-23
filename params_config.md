# 参数配置

数据类型为 Object, 具体参数参考如下:

```
{
    // 项目名称
    "name": "test",
    // 版本
    "version": "0.0.2",
    // 项目类型
    "type": "vue",
    // 是否使用 REM
    "REM": false,
    // 是否对 JS 进行 ES.Next 语法的编译
    "ES.Next": true,
    // 注入 webpack 别名
    // 是否热更新
    "hot": false,
    "alias": {
        "$": "./src/assets/jquery.min.js"
    },
    // 注入 webpack 全局对象
    "global": {
        "$": "jquery"
    },
    // 注入 webpack externals
    "externals": {
        "vue": "Vue"
    },
    // 各种环境配置
    "env": {
        "dev-test": {
            "alias": {
                "axios": "./src/assets/axios.min.js"
            }
        }
    },
    // 开发工作流相关配置
    "workflow.dev": {
        // 监听额外的文件夹，变动刷新浏览器
        "watch.reload": [
            "./src/test/**/*"
        ],
        // 用户配置参数
        // 根据用户输入 webpack define 插件变量
        // * 全部用户在 JS 文件中变量 process.args.token4Common 编译为 abc
        // 用户为 test1，在 JS 文件中变量 process.args.token4User 编译为 123
        // 用户为 test2，在 JS 文件中变量 process.args.token4User 编译为 321
        "user.args": {
            "*": {
                "token4Common": "abc"
            },
            "test1": {
                "token4User": 123
            },
            "test2": {
                "token4User": 321
            }
        },
        // 指向环境
        "env": "dev-test"
    },
    // 构建工作流相关配置
    "workflow.build": {
        // 对资源生成 时间戳 ( timestamp ) / 版本号 ( version ) / 无 ( '' )
        // 时间戳：<script src="./js/main.js?t=1523518772795"></script>
        // 版本号：<script src="./js/main.js?v=0.0.1"></script>
        // 无：<script src="./js/main.js"></script>
        "cache": "version",
        // 类型于 1.x 版本 assets，构建时候对 html 文件引入的资源加入主域
        // 例如：<script src="./js/main.js"></script>
        // 输出：<script src="https://legox.org/js/main.js"></script>
        "html.resourcesDomain": "https://legox.org",
        // 需要执行的 shell 模块文件
        "shell": "./shell.js",
        // 构建出 webpack stats.json，有助于分析模块打包占比
        "output.webpackStats": true,
        // 是否仅仅执行 Shell 模块
        "onlyRunShell": true,
        // 用户配置参数
        "user.args": {
            "*": {
                "token4Common": "abc"
            },
            "test1": {
                "token4User": 123
            },
            "test2": {
                "token4User": 321
            }
        },
        // 指向环境
        "env": "preview"
    },
    // 存放 node_modules 的目录绝对路径
    "root": "/Users/lijialiang/legoflow@2",
    // 用户名
    "user": "ce111",
    // 端口号
    "port": "3000",
    "nodeBin": "",
    // 自动打开 chrome
    "autoOpenChrome": true,
    // 是否启动实验功能
    "lab": false,
    // 项目的绝对路径
    "projectPath": "/Users/lijialiang/legoflow@2/__test__/test_1",
    // 需要执行的工作流配置
    "workflow": "build"
}
```
