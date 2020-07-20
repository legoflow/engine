const _ = require('lodash')
const glob = require('glob')
const webpack = require('webpack')
const path = require('path')
const StatsPlugin = require('stats-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WebpackBar = require('webpackbar')
const HtmlInjectAssetsWebpackPlugin = require('html-inject-assets-webpack-plugin')
const FsCopyWebpackPlugin = require('fs-copy-webpack-plugin')
const WorkerPlugin = require('worker-plugin')

module.exports = (config) => {
  const { projectPath } = config

  let plugins = [
    new webpack.ProvidePlugin(config.global || { }),
    new webpack.DefinePlugin(config.args || { }),
    new VueLoaderPlugin()
  ]

  // friendlyErrors
  const successMessage = []

  if (config.friendlyErrors && config.workflow === 'dev') {
    if (config.mode === 'webpack') {
      successMessage.push(`Running: http://${config.ip}:${config.webpackPort}`)
    } else {
      let bsPort = 0

      Object.defineProperty(config, 'bsPort', {
        get () {
          return bsPort
        },
        set (newValue) {
          bsPort = newValue

          successMessage.push(`Running: http://${config.ip}:${bsPort}`)
        }
      })
    }

    plugins.push(
      new FriendlyErrorsWebpackPlugin({
        compilationSuccessInfo: {
          messages: successMessage
        },
        onErrors (severity, errors) {
          config.friendlyErrorsOutput = true

          if (errors instanceof Array) {
            errors.forEach((item, index) => {
              if (item.file.indexOf('./src/') >= 0) {
                errors[index].file = `./src/${item.file.split('./src/')[1]}`
              }
            })
          }
        },
        clearConsole: true
      })
    )
  }

  const workflowConfig = config[`workflow.${config.workflow}`]

  // hot reload
  const isHotReload = workflowConfig['hot.reload'] || false

  if (isHotReload && config.workflow == 'dev') {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  //  banner
  if (config.workflow === 'build') {
    plugins.push(
      new webpack.BannerPlugin({
        banner: config.banner,
        raw: true
      })
    )
  }

  // output stats
  if (config.workflow === 'build' && workflowConfig['output.webpackStats'] == true) {
    plugins.push(
      new StatsPlugin('../../stats.json', {
        chunkModules: true
      })
    )
  }

  if (config.mode === 'webpack') {
    let { html, dll } = config.webpack || { }
    const isBuildWorkflow = config.workflow === 'build'

    let manifestFiles = []
    let dllOptions = []
    let dllFiles = []

    if (config.workflow === 'build') {
      manifestFiles = glob.sync(path.resolve(projectPath, './dll/*.manifest.json'))
    }

    const defaultHtml = {
      template: './src/html/index.html',
      filename: 'index.html'
    }

    !html && (html = [defaultHtml])

    !Array.isArray(html) && (html = [html])

    html.forEach((item) => {
      item.template && item.template.indexOf('./src') === 0 && (item.template = path.resolve(projectPath, item.template))
      isBuildWorkflow && (item.filename = `../${item.filename}`)

      plugins.push(
        new HtmlWebpackPlugin(item)
      )

      // 根据每个 html 模板判断载入 dll
      if (manifestFiles.length > 0) {
        const { dll: itemDll } = item

        if (itemDll) {
          const dllAssets = []

          itemDll.forEach((itemDllItem) => {
            dllAssets.push(`${itemDllItem}.dll.js`)
            dllFiles.push(`${itemDllItem}.dll.js`)
          })

          dllOptions.push({
            files: [item.filename],
            append: false,
            assets: dllAssets
          })
        } else {
          // include all dll
          const dllAssets = glob.sync(path.resolve(projectPath, './dll/*.dll.js')).map(v => path.basename(v))
          dllFiles = _.concat(dllFiles, dllAssets)

          dllOptions.push({
            files: [item.filename],
            append: false,
            assets: dllAssets
          })
        }
      }
    })

    if (config.workflow === 'build') {
      if (!config.webpack['bundle.css.useStyleLoader']) {
        const name = config.cacheFlag ? `../css/[name].${config.cacheFlag}.css` : '../css/[name].css'

        plugins.push(new MiniCssExtractPlugin({
          filename: name,
          chunkFilename: name
        }))
      }

      // dll
      if (dll && manifestFiles.length > 0) {
        manifestFiles.forEach((item, index) => {
          plugins.push(
            new webpack.DllReferencePlugin({
              context: projectPath,
              manifest: require(item)
            })
          )
        })
      }

      // dll 插入
      if (dllFiles.length > 0) {
        dllOptions.forEach((item, index) => {
          plugins.push(
            new HtmlWebpackIncludeAssetsPlugin(item)
          )
        })

        dllFiles = _.uniq(dllFiles)

        dllFiles.forEach((item, index) => {
          dllFiles[index] = {
            from: path.resolve(projectPath, `./dll/${item}`),
            to: path.resolve(projectPath, `./dist/js/${item}`)
          }
        })

        plugins.push(new CopyWebpackPlugin(dllFiles))
      }
    }
  }

  if (config.isTS) {
    plugins.push(
      new ForkTsCheckerWebpackPlugin({
        // tslint: true,
        vue: true,
        formatter: 'codeframe'
      })
    )
  }

  // 注入小工具脚本
  if (config.workflow === 'dev' && config.mode === 'webpack') {
    plugins.push(
      new HtmlWebpackIncludeAssetsPlugin({
        assets: ['https://s1.yy.com/ued_web_static/lib/lego/log/dev.js'],
        append: false
      })
    )
  }

  if (config.workflow === 'build') {
    // build other plugins
    plugins.push(
      new webpack.NoEmitOnErrorsPlugin()
    )

    plugins.push(
      new webpack.optimize.ModuleConcatenationPlugin()
    )

    plugins.push(
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { autoprefixer: { browsers: ['> 0.01%'] } },
        canPrint: true
      })
    )
  }

  if (config.mode === 'webpack' && config.from === 'cli' && config.friendlyErrors) {
    plugins.push(
      new WebpackBar({
        once: config.workflow === 'dev',
        name: config.workflow === 'dev' ? 'dev' : 'build'
      })
    )
  }

  if (config.mode === 'webpack' && config.workflow === 'build' && config.webpack['build.htmlInject']) {
    plugins.push(
      new HtmlInjectAssetsWebpackPlugin(config.webpack['build.htmlInject'], { projectPath })
    )
  }

  if (config.mode === 'webpack' && config.workflow === 'dev' && config.webpack['dev.htmlInject']) {
    plugins.push(
      new HtmlInjectAssetsWebpackPlugin(config.webpack['dev.htmlInject'], { projectPath })
    )
  }

  if (config.mode === 'webpack' && config.workflow === 'build' && config.webpack['build.copy']) {
    plugins.push(
      new FsCopyWebpackPlugin({
        root: projectPath,
        files: config.webpack['build.copy']
      })
    )
  }

  if (config.mode === 'webpack' && config.webpack['bundle.worker']) {
    plugins.push(new WorkerPlugin())
  }

  return plugins
}
