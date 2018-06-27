'use strict';

const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const del = require('del');

const Messager = require('./messager');
const messager = new Messager( );

module.exports = function ( config ) {
    const { projectPath } = config;

    const { dll } = config.webpack || { };

    if ( !dll ) {
        messager.stop( 'dll config undefined' );

        return void 0;
    }

    del.sync( `${ projectPath }/dll/**/*`, { force: true } );

    const dllOptions = {
        mode: 'none',
        entry: dll,
        output: {
            filename: '[name].dll.js',
            path: path.resolve( projectPath, 'dll' ),
            library: '_dll_[name]',
        },
        plugins: [
            new webpack.DllPlugin( {
                name: '_dll_[name]',
                path: path.join( projectPath, 'dll', '[name].manifest.json'),
            } ),
        ],
        context: projectPath,
    }

    const compiler = webpack( dllOptions );

    compiler.run( ( error, stats ) => {
        if ( error ) {
            messager.stop( `dll 打包错误: ${ error.toString( ) }` );
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
                messager.log( msg );

                messager.stop( `dll 打包错误` );
            }
            else {
                messager.success( '构建完成' );
            }
        }
    } )
};
