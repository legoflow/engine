'use strict';

const webpackRules = require('../common/webpack_rules');
const webpackResolve = require('../common/webpack_resolve');
const webpackPlugins = require('../common/webpack_plugins');

module.exports = function ( config ) {
    let { entry, ip, alias, projectPath, root, user, args, version, system, cacheFlag } = config;

    const workflowConfig = config[ 'workflow.build' ];

    const { publicPath } = workflowConfig;

    let chunkFilename = '[name].js';

    if ( cacheFlag ) {
        chunkFilename = `[name].${ cacheFlag }.js`;
    }

    const outputPath = `${ projectPath }/dist/js`;

    const webpackOptions = {
        mode: 'none',
        entry,
        output: {
            filename: config.mode !== 'webpack' ? '[name].js' : chunkFilename,
            chunkFilename,
            path: system === 'mac' ? outputPath : outputPath.pathWinNorm( ),
            publicPath: publicPath || './js/',
        },
        module: {
            rules: webpackRules( config ),
        },
        externals: config.externals || { },
        resolve: webpackResolve( config ),
        plugins: webpackPlugins( config ),
        context: system === 'mac' ? projectPath : projectPath.pathWinNorm( ),
    }

    config.webpackOptions = webpackOptions;
};
