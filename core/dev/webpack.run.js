'use strict';

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const chalk = require('chalk');

let config = void 0;
let messager = void 0;

const run = ( resolve, reject ) => {
    const { ip, webpackPort, webpackOptions, webpackDevServerOptions } = config;

    const compiler = webpack( webpackOptions );

    new webpackDevServer( compiler, webpackDevServerOptions ).listen( webpackPort, ip, ( err ) => {
        if ( err ) throw err;

        config.mode !== 'webpack' ? console.log( '[WEBPACK SERVER]', `http://${ ip }:${ webpackPort }` ) : console.log( `Webpack version ${ chalk.bold( webpack.version ) }` );

        resolve( );
    } );
};

module.exports = ( _config_, _messager_ ) => new Promise( ( resolve, reject ) => {
    config = _config_;
    messager = _messager_;

    run( resolve, reject );
} );