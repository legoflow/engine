'use strict';

const webpack = require('webpack');
const { CheckerPlugin } = require('awesome-typescript-loader');
const StatsPlugin = require('stats-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = ( config ) => {
    let plugins = [
        new webpack.ProvidePlugin( config.global || { } ),
        new webpack.DefinePlugin( config.args || { } ),
        new CheckerPlugin( ),
    ]

    // friendlyErrors
    if ( config.friendlyErrors ) {
        plugins.push(
            new FriendlyErrorsWebpackPlugin( {
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
