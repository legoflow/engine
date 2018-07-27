'use strict';

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const network = require('network');
const findFreePort = require('find-free-port');
const watch = require('gulp-watch');

const webpackEntry = require('./core/common/webpack_entry');

const webpackOptions = require('./core/dev/webpack.options');
const webpackRun = require('./core/dev/webpack.run');
const gulp = require('./core/dev/gulp');

const Messager = require('./messager');
const messager = new Messager( );

const util = require('./util');

const getShell = require('./core/common/get_shell');

let config = void 0;
let localIP = void 0;
let getLocalIPCounter = 0;

network.get_private_ip( ( err, ip ) => {
    if ( err ) throw err; localIP = ip;
} )

const webpackDevServerLaunchTimer = ( ip, port, resolve ) => {
    axios( `http://${ ip }:${ port }` ).then( ( response ) => {
        if ( response.status == 200 && response.data.length > 0 ) {
            resolve( );
        }
        else{
            setTimeout( ( ) => {
                webpackDevServerLaunchTimer( ip, port, resolve );
            }, 500 );
        }
    } );
}

const start = async ( _config_ ) => {
    if ( !localIP && getLocalIPCounter < 10 ) {
        ++getLocalIPCounter;
        setTimeout( ( ) => start( _config_ ), 300 );
        return void 0;
    }
    else if ( getLocalIPCounter >= 10 ) {
        localIP = '127.0.0.1';
    }

    _config_.ip = localIP;

    let { shell, onlyRunShell } = _config_[ 'workflow.dev' ];

    if ( shell && shell.indexOf( './' ) === 0 ) {
        shell = path.resolve( _config_.projectPath, shell );
    }

    if ( shell && !fs.existsSync( shell ) ) {
        messager.error( 'shell file undefined.' );

        shell = void 0;
    }

    const shellFunc = shell ? getShell( shell, _config_, messager ) : void 0;

    if ( shell && shellFunc && shellFunc.init ) {
        await shellFunc.init( _config_ );
    }

    // common config reslove
    config = require('./core/common/common_config')( _config_, messager );

    // get free port
    // FIXME: 发现由 webpack mode 启动的服务，会被标记为 freePort
    // maybe 与 webpack dev service & index.html 插件有关系
    await new Promise( ( resolve, reject ) => {
        const port = parseInt( config.port );
        findFreePort( port, port + 10, config.ip, ( err, freePort ) => {
            config.port = freePort;

            resolve( );
        } );
    } )

    // get webpack free port
    if ( config.mode === 'webpack' ) {
        config.webpackPort = config.port;
    }
    else {
        await new Promise( ( resolve, reject ) => {
            const port = parseInt( config.webpackPort );
            findFreePort( port, port + 10, config.ip, ( err, freePort ) => {
                config.webpackPort = freePort;

                resolve( );
            } );
        } )
    }

    const entryFiles = webpackEntry( config );

    config.entry = entryFiles;

    try {
        webpackOptions( config );

        if ( shell && shellFunc && shellFunc.before ) {
            await shellFunc.before( config );
        }

        if ( shell && onlyRunShell && shellFunc ) {
            shellFunc.after ? await shellFunc.after( config ) : await shellFunc( config );

            return void 0;
        }

        await webpackRun( config, messager );

        await ( ( ) => new Promise( ( resolve, reject ) => {
            webpackDevServerLaunchTimer( config.ip, config.webpackPort, resolve );
        } ) )( )

        watch( `${ config.projectPath }/legoflow.*`, ( ) => {
            messager.notice( '配置修改后, 重启工作流后生效' );
        } );

        if ( config.mode !== 'webpack' ) {
            const { bsPort } = await gulp( config, messager );
            config.bsPort = bsPort;
        }
        else {
            config.bsPort = config.webpackPort;
        }

        if ( shell && shellFunc ) {
            shellFunc.after ? await shellFunc.after( config ) : await shellFunc( config );
        }

        if ( config.autoOpenChrome ) {
            util.chromeOpen( `http://${ config.ip }:${ config.bsPort }` );
        }

        messager.success( config );
    } catch ( err ) {
        console.error( '[DEV@WEBPACK ERROR]', err );

        messager.error( err );
    }
}

module.exports = start;
