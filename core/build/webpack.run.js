'use strict';

const webpack = require('webpack');

let config = void 0;
let messager = void 0;

const run = ( resolve, reject ) => {
    const { webpackOptions } = config;

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
                !config.friendlyErrorsOutput && messager.log( msg );

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

    run( resolve, reject );
} );
