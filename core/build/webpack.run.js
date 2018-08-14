'use strict'

const webpack = require('webpack')

let config = void 0
let messager = void 0

const run = (resolve, reject) => {
  const { webpackOptions } = config

  const workflowConfig = config['workflow.build']

  const compiler = webpack(webpackOptions)

  compiler.hooks.afterEmit.tap('GetHash', (compilation) => {
    config.cacheFlag === '[hash]' && (config.cacheFlag = compilation.hash)
  })

  let statsOptions = {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
    assets: false,
    entrypoints: false
  }

  if (workflowConfig && workflowConfig['show.stats']) {
    statsOptions = Object.assign(statsOptions, workflowConfig['show.stats'])
  }

  compiler.run((error, stats) => {
    if (error) {
      messager.stop(`JS 打包错误: ${error.toString()}`)
    } else {
      const msg = stats.toString(statsOptions)

      if (stats.compilation.errors.length > 0) {
        !config.friendlyErrorsOutput && messager.log(msg)

        messager.stop(`JS 打包错误`)
      } else {
        console.log(msg)

        config.mode != 'webpack' && messager.log('JS 构建完成')

        resolve()
      }
    }
  })
}

module.exports = (_config_, _messager_) => new Promise((resolve, reject) => {
  config = _config_
  messager = _messager_

  run(resolve, reject)
})
