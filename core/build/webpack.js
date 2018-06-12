'use strict';

const path = require('path');
const _ = require('lodash');
const webpack = require('webpack');

const webpackRules = require('../common/webpack_rules');
const webpackResolve = require('../common/webpack_resolve');
const webpackPlugins = require('../common/webpack_plugins');

let config = void 0;
let messager = void 0;

const start = ( resolve, reject ) => {
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

    const compiler = webpack( webpackOptions );

    compiler.hooks.afterEmit.tap( 'GetHash', ( compilation ) => {
        config.cacheFlag === '[hash]' && ( config.cacheFlag = compilation.hash );
    } )

    compiler.run( ( error, stats ) => {
        if ( error ) {
            messager.stop( `JS 打包错误: ${ error.toString( ) }` );
        }
        else {
            const msg = stats.toString( {
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false,
            } );

            if ( stats.compilation.errors.length > 0 ) {
                // console.error( msg );
                messager.stop( `JS 打包错误` );
            }
            else {
                console.log( msg );

                messager.log( 'JS 构建完成' );

                resolve( );
            }
        }
    } )
};

module.exports = ( _config_, _messager_ ) => new Promise( ( resolve, reject ) => {
    config = _config_;
    messager = _messager_;

    start( resolve, reject );
} );
