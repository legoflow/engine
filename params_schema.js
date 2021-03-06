export default {
  name: String,
  version: String,
  type: String,
  REM: Boolean,
  'ES.Next': Boolean,
  ESLint: Boolean,
  alias: Object,
  global: Object,
  externals: Object,
  env: Object,
  includeModules: Array,
  mode: String,
  friendlyErrors: Boolean,
  'user.args': Object,
  webpack: {
    imageQuality: Number,
    html: Object,
    dll: Array,
    include: {
      esnext: Array,
      vue: Array
    },
    babelModules: String,
    uglifyOptions: Object,
    VueChunkStyle: Boolean,
    'sass.globalResources': Array,
    'dev.https': Boolean,
    'build.sourceMap': Boolean,
    'dev.htmlInject': Object,
    'build.htmlInject': Object,
    'build.copy': Object,
    'bundle.worker': Boolean,
    'bundle.css.useStyleLoader': Boolean
  },
  'workflow.dev': {
    env: String,
    'hot.reload': Boolean,
    'watch.reload': Array,
    'user.args': Object,
    proxy: Object,
    shell: String,
    onlyRunShell: Boolean
  },
  'workflow.build': {
    publicPath: String,
    'html.resourcesDomain': String,
    'css.resourcesDomain': String,
    'bundle.limitResourcesSize': Number,
    cache: String,
    'user.args': String,
    env: String,
    shell: String,
    onlyRunShell: Boolean,
    'output.webpackStats': Boolean
  }
}
