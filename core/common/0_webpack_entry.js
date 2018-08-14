'use strict'

const path = require('path')
const glob = require('glob')

module.exports = (config) => {
  let { entry, projectPath, ip, webpackPort, workflow } = config

  let files = [ ]
  let entrys = { }

  const workflowConfig = config[ 'workflow.dev' ] || { }

  const hot = workflowConfig[ 'hot.reload' ]

  if (!entry) {
    const jsFolderPath = path.resolve(projectPath, './src/js')

    files = glob.sync(`${jsFolderPath}/*.*(js|ts)`) || [ ]

    files = files.filter(v => path.basename(v)[ 0 ] !== '_' && v.indexOf('.d.ts') < 0)
  } else {
    if (typeof entry === 'string') {
      entry = [ entry ]
    }

    if (Array.isArray(entry)) {
      files = entry

      files = files.map(v => v.indexOf('./src/') === 0 ? path.resolve(projectPath, v) : v)
    } else if (typeof entry === 'object') {
      files = { }

      for (let name in entry) {
        let entryPath = entry[ name ]

        entryPath.indexOf('./src/') === 0 && (entryPath = path.resolve(projectPath, entryPath))

        files[ name ] = entryPath
      }
    }
  }

  if (Array.isArray(files)) {
    files.forEach((item) => {
      let basename = void 0

      if (item.indexOf('.js') > 0) {
        basename = path.basename(item, '.js')
      } else if (item.indexOf('.ts') > 0) {
        basename = path.basename(item, '.ts')
      }

      entrys[ basename ] = item
    })
  } else {
    entrys = files
  }

  if (workflow === 'dev') {
    for (let name in entrys) {
      const entryPath = entrys[ name ]
      entrys[ name ] = hot == true ? [ `webpack-dev-server/client?http://${ip}:${webpackPort}`, 'webpack/hot/dev-server', entryPath ] : [ `webpack-dev-server/client?http://${ip}:${webpackPort}`, entryPath ]
    }
  }

  return entrys
}
