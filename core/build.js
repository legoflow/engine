'use strict';

const del = require('del');
const fs = require('fs-extra');
const moment = require('moment');
const path = require('path');

const messager = require('./common/messager');
const webpackEntry = require('./common/webpack_entry');

const webpack = require('./build/webpack');
const gulp = require('./build/gulp');
const runShell = require('./build/run_shell');

module.exports = async ( _config_ ) => {
    // common config reslove
    let config = require('./common/common_config')( _config_, messager );

    const entryFiles = webpackEntry( config );

    config.entry = entryFiles;

    config.banner = `
/*!
 * ${ config.name }
 * @version: ${ config.version }
 * @author: ${ config.user }
 * @update: ${ moment( ).format('YYYY-MM-DD hh:mm:ss') }
 */
`;

    try {
        require('./common/print_config')( config );

        del.sync( `${ config.path }/dist`, { force: true } );

        let { shell, onlyRunShell } = config[ 'workflow.build' ];

        if ( shell && shell.indexOf( './' ) === 0 ) {
            shell = path.resolve( config.projectPath, shell );
        }

        if ( shell && !fs.existsSync( shell ) ) {
            messager.error( 'shell file undefined.' );

            shell = void 0;
        }

        if ( shell && onlyRunShell ) {
            runShell( shell, config, messager );

            return void 0;
        }

        fs.mkdirSync( `${ config.path }/dist` );
        fs.mkdirSync( `${ config.path }/dist/img` );
        fs.mkdirSync( `${ config.path }/dist/css` );
        fs.mkdirSync( `${ config.path }/dist/js` );

        await webpack( config, messager );

        await gulp( config, messager );

        if ( shell ) {
            runShell( shell, config, messager );
        }
        else {
            messager.success( );
        }
    } catch ( err ) {
        console.error( '[BUILD@WEBPACK ERROR]', err );

        messager.error( err );
    }
}
