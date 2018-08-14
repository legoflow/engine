'use strict'

const path = require('path')

module.exports = (config) => {
  let { alias, root, includeModules } = config

  if (!includeModules) {
    includeModules = [ ]
  }

  if (root.toLocaleLowerCase().indexOf('yarn') > 0) {
    includeModules.push(
      path.resolve(root, '../')
    )
  }

  return {
    alias,
    modules: [
      path.resolve(root, './node_modules'),
      ...includeModules
    ],
    extensions: [
      '.js', '.ts', '.tsx', '.jsx',
      '.vue', '.art', '.html', '.tpl',
      '.scss', '.css', '.json',
      '.svg'
    ]
  }
}
