'use strict';

const del = require('del');
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');

const webpackEntry = require('./core/common/webpack_entry');

const webpackOptions = require('./core/build/webpack.options');
const webpackRun = require('./core/build/webpack.run');
const gulp = require('./core/build/gulp');
const getShell = require('./core/common/get_shell');
const util = require('../util');

const Messager = require('./messager');
const messager = new Messager( );

module.exports = async ( _config_ ) => {
    let { shell, onlyRunShell } = _config_[ 'workflow.build' ];

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
    let config = require('./core/common/common_config')( _config_, messager );

    const entryFiles = webpackEntry( config );

    config.entry = entryFiles;

    config.banner = `
/*!
 * ${ config.name }
 * @version: ${ config.version }
 * @author: ${ config.user }
 * @update: ${ moment( ).format('YYYY-MM-DD HH:mm:ss') }
 */
`;

    try {
        del.sync( `${ config.path }/dist`, { force: true } );

        webpackOptions( config );

        if ( shell && shellFunc && shellFunc.before ) {
            await shellFunc.before( config );
        }

        if ( shell && onlyRunShell && shellFunc ) {
            shellFunc.after ? await shellFunc.after( ) : await shellFunc( );

            return void 0;
        }

        fs.mkdirSync( `${ config.path }/dist` );

        config.mode !== 'webpack' && fs.mkdirSync( `${ config.path }/dist/img` );
        config.mode !== 'webpack' && fs.mkdirSync( `${ config.path }/dist/css` );
        config.mode !== 'webpack' && fs.mkdirSync( `${ config.path }/dist/js` );

        await webpackRun( config, messager );

        config.mode !== 'webpack' && await gulp( config, messager );

        if ( shell && shellFunc ) {
            shellFunc.after ? await shellFunc.after( config ) : await shellFunc( config );
        }
        else {
            messager.success( );
        }

        if ( config.autoOpenChrome ) {
            util.chromeOpen( `${ config.projectPath }/dist` );
        }
    } catch ( err ) {
        console.error( '[BUILD@WEBPACK ERROR]', err );

        messager.error( err );
    }
}
