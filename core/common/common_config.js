'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const moment = require('moment')

const resolve = (_config_) => {
  let config = _.cloneDeep(_config_)

  const { projectPath, root, env, user, workflow, includeModules } = config

  if (typeof config.isTS === 'undefined') {
    config.isTS = fs.existsSync(path.resolve(projectPath, 'tsconfig.json'))
  }

  const { cache } = config[ 'workflow.build' ]

  config.cacheFlag = void 0

  config.buildTime = moment().format('YYYY-MM-DD HH:mm:ss')

  switch (cache) {
    case 'timestamp':
      config.cacheFlag = (new Date()).getTime()
      break
    case 'version':
      config.cacheFlag = config.version || '0.0.0'
      break
    case 'hash':
      config.cacheFlag = '[hash]'
      break
  }

  config.path = projectPath.pathNorm()
  config.projectPath = projectPath.pathNorm()

  if (!config.system) {
    config.system = process.platform === 'win32' ? 'win' : 'mac'
  }

  const workflowConfig = config[ `workflow.${workflow}` ] || { }

  const defaultAlias = {
    'axios': `${projectPath}/node_modules/axios`,
    'moment': `${projectPath}/node_modules/moment`,
    'lodash': `${projectPath}/node_modules/lodash`,
    '@local': `${projectPath}/node_modules`,
    '@tpl/helper': `${root}/node_modules/art-template/lib/runtime`
  }

  const nowENV = workflowConfig[ 'env' ] || workflow

  config.alias = Object.assign(defaultAlias, config.alias)

  if (typeof env !== 'undefined' && typeof env[ nowENV ] !== 'undefined') {
    const __config__ = env[ nowENV ]

    for (let key in __config__) {
      const value = __config__[ key ]

      if (!config[ key ] || typeof config[ key ] !== 'object') {
        config[ key ] = value
      } else {
        config[ key ] = _.merge(config[ key ], value)
      }
    }
  }

  // to absolute path
  for (let item in config.alias) {
    if (typeof config.alias[ item ] === 'string' && config.alias[ item ].indexOf('./') === 0) {
      config.alias[ item ] = path.resolve(projectPath, config.alias[ item ])
    }
  }

  if (includeModules && includeModules.length > 0) {
    includeModules.forEach((item, index) => {
      if (typeof item === 'string' && item.indexOf('./') === 0) {
        config.includeModules[ index ] = path.resolve(projectPath, item)
      }
    })
  }

  // 用户自定义开发参数
  let args = {
    'process.env': `"${workflow}"`,
    'process.environment': `"${nowENV}"`,
    'process.args': { },
    'process.build_time': `"${config.buildTime}"`
  }

  const envUserArgs = workflowConfig[ 'user.args' ]

  if (typeof envUserArgs != 'undefined') {
    for (let key in envUserArgs) {
      if (key === user || key == '*') {
        args[ 'process.args' ] = _.assign(args[ 'process.args' ], envUserArgs[ key ])
      }
    }
  }

  config.args = args

  config.banner = `
/*!
 * ${config.name}
 *
 * @version: ${config.version}
 * @author: ${config.user}
 * @update: ${config.buildTime}
 */
`

  return config
}

module.exports = (_config_, messager) => {
  try {
    return resolve(_config_)
  } catch (e) {
    console.error('[COMMON_CONFIG]: ', e)

    messager.stop('配置文件解析错误')
  }
}
