'use strict'

const fs = require('fs-extra')
const util = require('../../util')

// TODO: legoflow.js shell support function
module.exports = (shell, _config_, messager) => {
  delete require.cache[ shell ]

  shell = require(shell)

  const { nodeBin } = _config_

  const pull = (module) => {
    return require(`${_config_.root}/node_modules/${module}`)
  }

  const nodeBinExec = (root, file, callback) => {
    if (!nodeBin || (nodeBin && !fs.existsSync(nodeBin))) {
      messager.stop('node bin undefined.')

      return void 0
    }

    shell.cd(root)

    shell.exec(`${nodeBin} ${file}`, callback)
  }

  const cycleFunc = { }

  if (shell.init) {
    cycleFunc.init = async function (config) {
      // messager.log( 'start to exec shell.init' );
      await shell.init({ config, messager, nodeBinExec, util, pull })
    }
  }

  if (shell.before) {
    cycleFunc.before = async function (config) {
      // messager.log( 'start to exec shell.before' );
      await shell.before({ config, messager, nodeBinExec, util, pull })
    }
  }

  if (shell.after) {
    cycleFunc.after = async function (config) {
      // messager.log( 'start to exec shell.after' );
      await shell.after({ config, messager, nodeBinExec, util, pull })
    }
  }

  if (Object.keys(cycleFunc).length > 0) {
    return cycleFunc
  } else {
    return async (config) => {
      // messager.log( 'start to exec shell' );
      await shell({ config, messager, nodeBinExec, util, pull })
    }
  }
}
