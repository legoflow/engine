'use strict';

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');

let config = void 0;
let messager = void 0;

const run = ( resolve, reject ) => {
    const { ip, webpackPort, webpackOptions, webpackDevServerOptions, mode } = config;

    mode === 'webpack' && console.log( `Webpack version ${ chalk.bold( webpack.version ) }` );

    const compiler = webpack( webpackOptions );

    new webpackDevServer( compiler, webpackDevServerOptions ).listen( webpackPort, ip, ( err ) => {
        if ( err ) throw err;

        mode !== 'webpack' && console.log( '[WEBPACK SERVER]', `http://${ ip }:${ webpackPort }` );

        resolve( );
    } );
};

module.exports = ( _config_, _messager_ ) => new Promise( ( resolve, reject ) => {
    config = _config_;
    messager = _messager_;

    run( resolve, reject );
} );
