const webpackRules = require('../common/1_webpack_rules')
const webpackResolve = require('../common/3_webpack_resolve')
const webpackPlugins = require('../common/2_webpack_plugins')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = function (config) {
  const { entry, projectPath, system, cacheFlag } = config

  const workflowConfig = config['workflow.build']

  const { publicPath } = workflowConfig

  let chunkFilename = '[name].js'

  if (cacheFlag) {
    chunkFilename = `[name].${cacheFlag}.js`
  }

  const outputPath = `${projectPath}/dist/js`

  const webpackOptions = {
    mode: 'production',
    performance: {
      hints: 'warning',
      maxAssetSize: 250000,
      maxEntrypointSize: 250000
    },
    entry,
    output: {
      filename: config.mode !== 'webpack' ? '[name].js' : chunkFilename,
      chunkFilename,
      path: system === 'mac' ? outputPath : outputPath.pathWinNorm(),
      publicPath: publicPath || './js/'
    },
    module: {
      rules: webpackRules(config)
    },
    externals: config.externals || { },
    resolve: webpackResolve(config),
    plugins: webpackPlugins(config),
    context: system === 'mac' ? projectPath : projectPath.pathWinNorm(),
    optimization: {
      minimize: false
    }
  }

  const UglifyJsPluginOptions = {
    cache: `${projectPath}/.cache/uglifyjs-webpack-plugin`,
    parallel: true
  }

  if (config.mode === 'webpack' && config.webpack.uglifyOptions) {
    UglifyJsPluginOptions.uglifyOptions = config.webpack.uglifyOptions
  }

  if (config.mode === 'webpack' && config.webpack['build.sourceMap'] == true) {
    UglifyJsPluginOptions.sourceMap = true
  }

  if (workflowConfig.noUglifyJs != true) {
    webpackOptions.optimization.minimize = undefined
    webpackOptions.optimization.minimizer = [new UglifyJsPlugin(UglifyJsPluginOptions)]
  }

  if (config.mode === 'webpack' && config.webpack && config.webpack['build.sourceMap'] == true) {
    webpackOptions.devtool = 'source-map'
  }

  if (config.mode === 'webpack' && config.webpack && config.webpack.happypack == true) {
    const os = require('os')
    const HappyPack = require('happypack')
    const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

    const injectRules = [
      { testFile: 'test.js', id: 'BuildJS' }
      // { testFile: 'test.scss', id: 'BuildScss', oneOf: 1, },
    ]

    webpackOptions.module.rules.forEach((item, index) => {
      injectRules.some((_ir) => {
        if (item.test.test(_ir.testFile)) {
          const pluginOptions = {
            id: _ir.id,
            loaders: item.use,
            threadPool: happyThreadPool,
            verbose: true
          }

          const use = [{
            loader: require.resolve('happypack/loader'),
            options: { id: _ir.id }
          }]

          if (item.oneOf) {
            const loaders = item.oneOf[_ir.oneOf].use

            item.oneOf[_ir.oneOf].use = use

            pluginOptions.loaders = loaders
          } else {
            webpackOptions.module.rules[index].use = use
          }

          webpackOptions.plugins.unshift(new HappyPack(pluginOptions))

          return true
        }

        return false
      })
    })
  }

  config.webpackOptions = webpackOptions
}
