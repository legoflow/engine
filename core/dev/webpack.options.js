const path = require('path')

const webpackRules = require('../common/1_webpack_rules')
const webpackResolve = require('../common/3_webpack_resolve')
const webpackPlugins = require('../common/2_webpack_plugins')

module.exports = (config) => {
  let { entry, projectPath, system } = config

  const workflowConfig = config['workflow.dev'] || { }

  const isHotReload = workflowConfig['hot.reload'] || false

  const srcFolderPath = path.resolve(projectPath, './src')

  const outputPath = `${projectPath}/dist/js`

  const webpackOptions = {
    mode: 'development',
    // devtool: 'cheap-eval-source-map',
    devtool: 'inline-source-map',
    entry,
    output: {
      filename: './js/[name].js',
      path: system === 'mac' ? outputPath : outputPath.pathWinNorm(),
      publicPath: ''
    },
    module: {
      rules: webpackRules(config)
    },
    externals: config.externals || { },
    resolve: webpackResolve(config),
    plugins: webpackPlugins(config),
    context: system === 'mac' ? projectPath : projectPath.pathWinNorm()
  }

  let webpackDevServerOptions = {
    host: '0.0.0.0',
    contentBase: srcFolderPath,
    hot: isHotReload,
    historyApiFallback: false,
    compress: false,
    noInfo: false,
    lazy: false,
    quiet: false,
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    },
    filename: 'bundle.js',
    watchOptions: {
      aggregateTimeout: 100,
      poll: 1000
    },
    proxy: workflowConfig.proxy || {},
    disableHostCheck: true,
    https: (config.webpack && config.webpack['dev.https']) || false
  }

  if (config.friendlyErrors) {
    webpackDevServerOptions.quiet = true
  }

  config.webpackOptions = webpackOptions
  config.webpackDevServerOptions = webpackDevServerOptions
}
