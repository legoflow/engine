'use strict';

const webpack = require('webpack');
const StatsPlugin = require('stats-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = ( config ) => {
    let plugins = [
        new webpack.ProvidePlugin( config.global || { } ),
        new webpack.DefinePlugin( config.args || { } ),
        new VueLoaderPlugin( ),
    ];

    // friendlyErrors
    if ( config.friendlyErrors ) {
        const successMessage = [ ];

        let bsPort = 0;

        Object.defineProperty( config, 'bsPort', {
            get ( ) {
                return bsPort;
            },
            set ( newValue ) {
                bsPort = newValue;

                successMessage.push( `Running: http://${ config.ip }:${ bsPort }` );
            },
        } )

        plugins.push(
            new FriendlyErrorsWebpackPlugin( {
                compilationSuccessInfo: {
                    messages: successMessage,
                },
                onErrors ( severity, errors ) {
                    if ( errors instanceof Array ) {
                        errors.forEach( ( item, index ) => {
                            if ( item.file.indexOf( './src/' ) >= 0 ) {
                                errors[ index ].file = `./src/${ item.file.split( './src/' )[ 1 ] }`;
                            }
                        } );
                    }
                },
                clearConsole: true,
            } ),
        )
    }

    const workflowConfig = config[ `workflow.${ config.workflow }` ];

    if ( config.workflow === 'build' ) {
        plugins.push(
            new UglifyJsPlugin( {
                cache: `${ config.projectPath }/.cache/uglifyjs-webpack-plugin`,
            } )
        )

        plugins.push(
            new webpack.NoEmitOnErrorsPlugin( )
        )

        plugins.push(
            new webpack.optimize.ModuleConcatenationPlugin( )
        )
    }

    // hot reload
    const isHotReload = workflowConfig[ 'hot.reload' ] || false;

    if ( isHotReload && config.workflow == 'dev' ) {
        plugins.push( new webpack.HotModuleReplacementPlugin( ) );
    }

    //  banner
    if ( config.workflow === 'build' ) {
        plugins.push(
            new webpack.BannerPlugin( {
                banner: config.banner,
                raw: true,
            } )
        );
    }

    // output stats
    if ( config.workflow === 'build' && workflowConfig[ 'output.webpackStats' ] == true ) {
        plugins.push(
            new StatsPlugin( '../../stats.json', {
                chunkModules: true,
            } )
        )
    }

    return plugins;
};
