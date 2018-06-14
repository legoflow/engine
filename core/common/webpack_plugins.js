'use strict';

const glob = require('glob');
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
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = ( config ) => {
    const { projectPath } = config;

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
                    config.friendlyErrorsOutput = true;

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
        let { html, dll } = config.webpack || { };
        const isBuildWorkflow = config.workflow === 'build';

        const manifestFiles = glob.sync( path.resolve( projectPath, './dll/*.manifest.json' ) );

        if ( config.workflow === 'build' ) {
            const name = config.cacheFlag ? `../css/[name].${ config.cacheFlag }.css` : '../css/[name].css';

            plugins.push( new MiniCssExtractPlugin( {
                filename: name,
                chunkFilename: name,
            } ) );

            // dll
            if ( dll && manifestFiles.length > 0 ) {
                manifestFiles.forEach( ( item, index ) => {
                    plugins.push(
                        new webpack.DllReferencePlugin( {
                            context: projectPath,
                            manifest: require( item ),
                        } )
                    )
                } );
            }

            const defaultHtml = {
                template: './src/html/index.html',
                filename: 'index.html',
            }

            !html && ( html = [ defaultHtml ] );

            !Array.isArray( html ) && ( html = [ html ] );

            html.forEach( ( item ) => {
                item.template && item.template.indexOf( './src' ) === 0 && ( item.template = path.resolve( projectPath, item.template ) );
                isBuildWorkflow && ( item.filename = `../${ item.filename }` );
                plugins.push( new HtmlWebpackPlugin( item ) );
            } )

            if ( manifestFiles.length > 0 ) {
                plugins.push(
                    new AddAssetHtmlPlugin( {
                        includeSourcemap: false,
                        filepath: path.resolve( projectPath, './dll/*.dll.js' ),
                    } )
                );
            }
        }
    }

    // if ( config.isTS ) {
    //     plugins.push(
    //         new ForkTsCheckerWebpackPlugin( {
    //             // tslint: true,
    //             vue: true,
    //             formatter: 'codeframe',
    //         } )
    //     )
    // }

    if ( config.workflow === 'build' ) {
        plugins.push(
            new UglifyJsPlugin( {
                cache: `${ projectPath }/.cache/uglifyjs-webpack-plugin`,
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
