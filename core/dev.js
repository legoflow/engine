'use strict';

const axios = require('axios');
const path = require('path');
const fs = require('fs');
const network = require('network');

const webpackEntry = require('./common/webpack_entry');

const webpack = require('./dev/webpack');
const gulp = require('./dev/gulp');

const Messager = require('./common/messager');
const messager = new Messager( );

const util = require('../util');

const getShell = require('./common/get_shell');

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
            }, 1000 );
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

    // common config reslove
    config = require('./common/common_config')( _config_, messager );

    config.ip = localIP;

    const entryFiles = webpackEntry( config );

    config.entry = entryFiles;

    try {
        let { shell, onlyRunShell } = config[ 'workflow.dev' ];

        if ( shell && shell.indexOf( './' ) === 0 ) {
            shell = path.resolve( config.projectPath, shell );
        }

        if ( shell && !fs.existsSync( shell ) ) {
            messager.error( 'shell file undefined.' );

            shell = void 0;
        }

        const shellFunc = shell ? getShell( shell, config, messager ) : void 0;

        if ( shell && onlyRunShell && shellFunc ) {
            shellFunc.after ? await shellFunc.after( ) : await shellFunc( );

            return void 0;
        }

        await webpack( config, messager );

        await ( ( ) => new Promise( ( resolve, reject ) => {
            webpackDevServerLaunchTimer( config.ip, config.webpackPort, resolve );
        } ) )( )

        const { bsPort } = await gulp( config, messager );

        config.bsPort = bsPort;

        if ( shell && shellFunc ) {
            shellFunc.after ? await shellFunc.after( ) : await shellFunc( );
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
