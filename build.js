'use strict'

const del = require('del')
const fs = require('fs-extra')
const path = require('path')

const webpackEntry = require('./core/common/0_webpack_entry')

const webpackOptions = require('./core/build/webpack.options')
const webpackRun = require('./core/build/webpack.run')
const gulp = require('./core/build/gulp')
const getShell = require('./core/common/get_shell')

const util = require('./util')

const Messager = require('./messager')
const messager = new Messager()

module.exports = async (_config_) => {
  let { shell, onlyRunShell } = _config_[ 'workflow.build' ]

  if (shell && shell.indexOf('./') === 0) {
    shell = path.resolve(_config_.projectPath, shell)
  }

  if (shell && !fs.existsSync(shell)) {
    messager.error('shell file undefined.')

    shell = void 0
  }

  const shellExecFunctions = shell ? getShell(shell, _config_, messager) : void 0

  if (shell && shellExecFunctions && shellExecFunctions.init) {
    await shellExecFunctions.init(_config_)
  }

  // common config reslove
  let config = require('./core/common/common_config')(_config_, messager)

  const entryFiles = webpackEntry(config)

  config.entry = entryFiles

  try {
    del.sync(`${config.path}/dist`, { force: true })

    webpackOptions(config)

    if (shell && shellExecFunctions && shellExecFunctions.before) {
      await shellExecFunctions.before(config)
    }

    if (shell && onlyRunShell && shellExecFunctions) {
      shellExecFunctions.after ? await shellExecFunctions.after() : await shellExecFunctions()

      return void 0
    }

    fs.mkdirSync(`${config.path}/dist`)

    config.mode !== 'webpack' && fs.mkdirSync(`${config.path}/dist/img`)
    config.mode !== 'webpack' && fs.mkdirSync(`${config.path}/dist/css`)
    config.mode !== 'webpack' && fs.mkdirSync(`${config.path}/dist/js`)

    await webpackRun(config, messager)

    config.mode !== 'webpack' && await gulp(config, messager)

    if (shell && shellExecFunctions) {
      shellExecFunctions.after ? await shellExecFunctions.after(config) : (typeof shellExecFunctions === 'function' && await shellExecFunctions(config))
    } else {
      messager.success()
    }

    if (config.autoOpenChrome) {
      util.chromeOpen(`${config.projectPath}/dist`)
    }
  } catch (err) {
    console.error('[BUILD@WEBPACK ERROR]', err)

    messager.error(err)
  }
}
