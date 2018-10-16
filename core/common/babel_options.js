'use strict'

module.exports = ({ babelModules = 'commonjs' }) => ({
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: babelModules,
        targets: { 'browsers': [ 'android >= 4' ] }
      }
    ]
  ],
  plugins: [
    // [ require.resolve('@babel/plugin-transform-react-jsx'), { pragma: 'h' } ],
    require.resolve('babel-plugin-transform-vue-jsx'),
    [ require.resolve('@babel/plugin-proposal-decorators'), { legacy: true } ],
    [ require.resolve('@babel/plugin-proposal-class-properties'), { loose: true } ],
    require.resolve('@babel/plugin-proposal-optional-chaining'),
    require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
    [ require.resolve('@babel/plugin-proposal-pipeline-operator'), { proposal: 'minimal' } ],
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    [ require.resolve('@babel/plugin-transform-runtime'), { corejs: 2 } ]
  ]
})
