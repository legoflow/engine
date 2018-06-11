'use strict';

const webpack = require('webpack');
const path = require('path');
const StatsPlugin = require('stats-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = ( config ) => {
    let plugins = [
        new webpack.ProvidePlugin( config.global || { } ),
        new webpack.DefinePlugin( config.args || { } ),
        new VueLoaderPlugin( ),
    ];

    // friendlyErrors
    const successMessage = [ ];

    if ( config.friendlyErrors && config.workflow === 'dev' ) {

        if ( config.mode === 'webpack' ) {
            successMessage.push( `Running: http://${ config.ip }:${ config.webpackPort }` );
        }
        else {
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
        }

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

    if ( config.mode === 'webpack' ) {
        let { html } = config.webpack || { };
        const isBuildWorkflow = config.workflow === 'build';

        const defaultHtml = {
            template: './src/html/index.html',
            filename: 'index.html',
        }

        !html && ( html = [ defaultHtml ] );

        !Array.isArray( html ) && ( html = [ html ] );

        html.forEach( ( item ) => {
            item.template && item.template.indexOf( './src' ) === 0 && ( item.template = path.resolve( config.projectPath, item.template ) );
            isBuildWorkflow && ( item.filename = `../${ item.filename }` );
            plugins.push( new HtmlWebpackPlugin( item ) );
        } )

        if ( config.workflow === 'build' ) {
            const name = config.cacheFlag ? `../css/[name].${ config.cacheFlag }.css` : '../css/[name].css';

            plugins.push( new MiniCssExtractPlugin( {
                filename: name,
                chunkFilename: name,
            } ) );
        }
    }

    if ( config.isTS ) {
        plugins.push(
            new ForkTsCheckerWebpackPlugin( {
                // tsconfig: getTsConfigJson( config ),
                // tslint: true,
                vue: true,
                formatter: 'codeframe',
            } )
        )
    }

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

        plugins.push(
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: { autoprefixer: { browsers: [ '> 0.01%', ] } },
                canPrint: true,
            } )
        )
    }

    return plugins;
};
