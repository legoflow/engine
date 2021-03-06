const _ = require('lodash')
const path = require('path')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

let babelOptions = require('../common/babel_options')

module.exports = (config) => {
  const isESNext = config['ES.Next']

  const { workflow, root, projectPath, ESLint, isTS, cacheFlag } = config

  const workflowConfig = config[`workflow.${workflow}`] || { }

  const webpackImageQuality = (config.webpack ? (config.webpack.imageQuality || 90) : 90) / 100

  const { publicPath } = workflowConfig

  let chunkFilename = '[name].js'

  if (cacheFlag) {
    chunkFilename = `[name].${cacheFlag}.js`
  }

  const isBuildWorkflow = config.workflow === 'build'

  const limitSize = workflow == 'build' ? (typeof workflowConfig['bundle.limitResourcesSize'] !== 'undefined' ? workflowConfig['bundle.limitResourcesSize'] : 5) : 1024 * 100

  const inlineNodeModules = path.resolve(root, './node_modules')
  const localNodeModules = path.resolve(projectPath, './node_modules')

  const exclude = [inlineNodeModules, localNodeModules]

  babelOptions = babelOptions({ babelModules: config.webpack && config.webpack.babelModules })

  if (root.toLocaleLowerCase().indexOf('yarn') > 0) {
    exclude.push(
      path.resolve(root, '../')
    )
  }

  const [postcssConfig] = glob.sync(path.resolve(projectPath, '.postcssrc.*'))

  const isBuildStyleSourceMap = !isBuildWorkflow

  const postcssOptions = !postcssConfig ? {
    sourceMap: isBuildStyleSourceMap,
    plugins: () => [
      require('postcss-preset-env')({
        stage: 0,
        browsers: ['> 0.01%']
      }),
      require('postcss-sprites')({
        alias: config.alias,
        stylesheetPath: '',
        spritePath: path.resolve(projectPath, './src/img'),
        filterBy (image) {
          if (!/\/slice\//.test(image.url)) {
            return Promise.reject()
          }

          return Promise.resolve()
        },
        groupBy (image) {
          const groups = /\/slice\/(.*?)\/.*/gi.exec(image.url)
          const groupName = groups ? groups[1] : ''

          image.retina = true
          image.ratio = 1

          if (groupName) {
            let ratio = /@(\d+)x$/gi.exec(groupName)

            if (ratio) {
              ratio = ratio[1]

              while (ratio > 10) {
                ratio = ratio / 10
              }

              image.ratio = ratio
            }
          }

          return Promise.resolve(groupName)
        },
        hooks: {
          onSaveSpritesheet (options, { groups, extension }) {
            return groups[0] ? path.join(options.spritePath, `${['sprite', ...groups].join('-')}.${extension}`) : path.join(options.spritePath, `sprite.${extension}`)
          }
        },
        spritesmith: {
          padding: 5
        }
        // verbose: true
      })
    ]
  } : {
    config: {
      path: postcssConfig
    }
  }

  const inlineSvgLoader = {
    loader: require.resolve('markup-inline-loader'),
    options: {
      strict: 'inline',
      svgo: {
        plugins: [
          { removeTitle: true },
          { removeUselessStrokeAndFill: false },
          { removeUnknownsAndDefaults: true },
          { removeStyleElement: true }
        ]
      }
    }
  }

  const vueRule = {
    test: /\.vue$/,
    use: [
      {
        loader: require.resolve('vue-loader'),
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      inlineSvgLoader
    ]
  }

  const cssModulesRuleUse = [
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 1,
        modules: true,
        localIdentName: '[local]_[hash:base64:8]',
        sourceMap: isBuildStyleSourceMap
      }
    },
    {
      loader: require.resolve('postcss-loader'),
      options: postcssOptions
    }
  ]

  const cssRuleUse = [
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders: 1,
        sourceMap: isBuildStyleSourceMap
      }
    },
    {
      loader: require.resolve('postcss-loader'),
      options: postcssOptions
    }
  ]

  if (config.workflow === 'build' && config.mode === 'webpack') {
    if (config.webpack['bundle.css.useStyleLoader']) {
      const styleLoader = {
        loader: require.resolve('style-loader'),
        options: {
          sourceMap: isBuildStyleSourceMap
        }
      }

      cssRuleUse.unshift(styleLoader)
      cssModulesRuleUse.unshift(styleLoader)
    } else {
      const MiniCssExtractPluginLoader = {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: publicPath || './'
        }
      }

      cssRuleUse.unshift(MiniCssExtractPluginLoader)
      cssModulesRuleUse.unshift(MiniCssExtractPluginLoader)
    }
  } else {
    const vueStyleLoader = {
      loader: require.resolve('vue-style-loader'),
      options: {
        sourceMap: isBuildStyleSourceMap
      }
    }

    cssRuleUse.unshift(vueStyleLoader)
    cssModulesRuleUse.unshift(vueStyleLoader)
  }

  // sass global resources
  const sassGlobalResources = []

  if (config.mode === 'webpack' && Array.isArray(config.webpack['sass.globalResources'])) {
    config.webpack['sass.globalResources'].forEach(item => {
      item.indexOf('./') === 0 && (item = path.resolve(projectPath, item))

      sassGlobalResources.push(item)
    })
  }

  const sassLoaders = [{
    loader: require.resolve('sass-loader'),
    options: {
      sourceMap: isBuildStyleSourceMap
    }
  }]

  sassGlobalResources.length > 0 && sassLoaders.push({
    loader: require.resolve('sass-resources-loader'),
    options: {
      resources: sassGlobalResources
    }
  })

  const scssModulesRuleUse = cssModulesRuleUse.concat(sassLoaders)

  const scssRuleUse = cssRuleUse.concat(sassLoaders)

  const filesName = cacheFlag ? `[name].${cacheFlag}.[ext]` : '[name].[ext]'

  const imageRule = {
    test: /\.(png|jpg|gif|jpeg|svg)$/,
    use: [
      {
        loader: require.resolve('url-loader'),
        options: {
          limit: 1024 * limitSize,
          name: `../img/${filesName}`,
          root: 'img'
        }
      }
    ]
  }

  if (config.workflow === 'build' && config.mode === 'webpack') {
    imageRule.use.push({
      loader: require.resolve('image-webpack-loader'),
      options: {
        mozjpeg: {
          progressive: true,
          quality: webpackImageQuality
        },
        optipng: {
          enabled: false
        },
        pngquant: {
          quality: [webpackImageQuality - 0.1, webpackImageQuality]
        },
        gifsicle: {
          interlaced: false
        }
      }
    })
  }

  const scssRule = {
    test: /\.scss$/,
    oneOf: [
      {
        resourceQuery: /module/,
        use: scssModulesRuleUse
      },
      {
        use: scssRuleUse
      }
    ]
  }

  const cssRule = {
    test: /\.css$/,
    oneOf: [
      {
        resourceQuery: /module/,
        use: cssModulesRuleUse
      },
      {
        use: cssRuleUse
      }
    ]
  }

  if (config.workflow === 'build' && config.mode === 'webpack' && config.webpack.VueChunkStyle == false) {
    const VueStyleLoader = {
      loader: require.resolve('vue-style-loader'),
      options: {
        sourceMap: isBuildStyleSourceMap
      }
    }

    const VueScssRule = _.cloneDeep(scssRuleUse).splice(1, scssRuleUse.length)

    VueScssRule.unshift(VueStyleLoader)

    scssRule.oneOf.unshift({
      resourceQuery: /^\?vue/,
      use: VueScssRule
    })

    const VueCssRule = _.cloneDeep(cssRuleUse).splice(1, cssRuleUse.length)

    VueCssRule.unshift(VueStyleLoader)

    cssRule.oneOf.unshift({
      resourceQuery: /^\?vue/,
      use: VueCssRule
    })
  }

  const rules = [
    imageRule,
    {
      test: /\.(ttf|woff|otf|eot|svga)$/,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: 1024 * limitSize,
            name: `../assets/${filesName}`,
            root: 'assets'
          }
        }
      ]
    },
    scssRule,
    cssRule,
    {
      test: /\.(tpl|art)$/,
      use: [require.resolve('art-template-loader')]
    },
    {
      test: /\.html$/,
      oneOf: [
        {
          resourceQuery: /^\?vue/,
          use: []
        },
        {
          use: [
            require.resolve('html-loader'),
            inlineSvgLoader
          ]
        }
      ]
    }
  ]

  let jsRule = void 0
  let tsRule = void 0
  let jsWorkerRule = void 0

  if (isESNext) {
    jsRule = {
      test: /\.*(js|jsx)$/,
      exclude,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: babelOptions
        }
      ]
    }

    jsWorkerRule = {
      test: /\.worker\.js$/,
      exclude,
      use: [
        {
          loader: require.resolve('worker-loader'),
          options: {
            fallback: false,
            name: config.mode !== 'webpack' ? '[name].js' : chunkFilename,
            publicPath
          }
        },
        {
          loader: require.resolve('babel-loader'),
          options: babelOptions
        }
      ]
    }
  }

  if (isTS) {
    tsRule = {
      test: /\.*(ts)$/,
      exclude,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: babelOptions
        },
        {
          loader: require.resolve('ts-loader'),
          options: {
            configFile: path.resolve(projectPath, './tsconfig.json'),
            context: projectPath,
            allowTsInNodeModules: true,
            transpileOnly: true,
            appendTsSuffixTo: [/\.vue$/]
          }
        }
      ]
    }
  }

  if (ESLint) {
    const [eslintConfig] = glob.sync(path.resolve(projectPath, '.eslintrc.*'))

    const eslintRule = {
      loader: require.resolve('eslint-loader'),
      options: {
        configFile: eslintConfig || (config.isTS ? path.resolve(__dirname, './default_ts_eslint.js') : path.resolve(__dirname, './default_js_eslint.js')),
        eslintPath: path.resolve(root, './node_modules/eslint')
      }
    }

    rules.push({
      enforce: 'pre',
      test: /\.(js|vue|ts)$/,
      exclude,
      use: [eslintRule]
    })
  }

  jsRule && rules.push(jsRule)
  tsRule && rules.push(tsRule)
  jsWorkerRule && rules.push(jsWorkerRule)

  rules.push(Object.assign(_.cloneDeep(vueRule), { exclude }))

  const arrayPathToAbsolute = (array) => {
    array.forEach((item, index) => {
      item.indexOf('./') === 0 && (array[index] = path.resolve(projectPath, item))
    })
  }

  let includeESNextModules = ['./node_modules/yypkg', './node_modules/@yy/']
  let includeVueModules = ['./node_modules/@yy/']

  if (config.mode === 'webpack' && config.webpack && config.webpack.include) {
    const { esnext, vue } = config.webpack.include

    esnext && (includeESNextModules = includeESNextModules.concat(esnext))
    vue && (includeVueModules = includeVueModules.concat(vue))
  }

  arrayPathToAbsolute(includeESNextModules)
  arrayPathToAbsolute(includeVueModules)

  rules.push({
    test: /\.*(js|jsx)$/,
    include: includeESNextModules,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: babelOptions
      }
    ]
  })

  rules.push(Object.assign(_.cloneDeep(vueRule), { include: includeVueModules }))

  rules.push({
    test: /\.*(js|jsx)$/,
    include: [
      /ansi-regex/,
      /strip-ansi/
    ],
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: babelOptions
      }
    ]
  })

  return rules
}
