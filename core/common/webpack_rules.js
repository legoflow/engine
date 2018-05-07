'use strict';

const path = require('path');
const autoprefixer = require('autoprefixer');

const getTsConfigJson = require('../common/get_tsconfig_json');
const babelOptions = require('../common/babel_options');

module.exports = ( config ) => {
    const isESNext = config[ 'ES.Next' ];

    const { workflow, root } = config;

    const workflowConfig = config[ `workflow.${ workflow }` ] || { };

    const limitSize = ( workflow == 'build' && workflowConfig[ 'bundle.limitResourcesSize' ] ) ? workflowConfig[ 'bundle.limitResourcesSize' ] : 1024 * 100;

    const appNodeModules = path.resolve( root, './node_modules' );

    const exclude = [ appNodeModules ];

    const vueScssLoadersString = `${ appNodeModules }/vue-style-loader!${ appNodeModules }/css-loader!${ appNodeModules }/sass-loader`;
    const vueSassLoadersString = `${ appNodeModules }/vue-style-loader!${ appNodeModules }/css-loader!${ appNodeModules }/sass-loader?indentedSyntax`;

    const autoprefixerOptions = {
        plugins: ( ) => [
            require('autoprefixer')( {
                browsers: [ '> 0.01%', ],
            } )
        ],
    }

    const rules = [
        {
            test: /\.(png|jpg|gif|svg|jpeg|svg)$/,
            exclude,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 1024 * limitSize,
                        name: '../img/[name].[ext]?[hash]',
                        root: 'img',
                    },
                }
            ]
        },
        {
            test: /\.(ttf|woff|otf|eot)$/,
            exclude,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 1024 * limitSize,
                        name: '../assets/[name].[ext]?[hash]',
                        root: 'assets',
                    },
                }
            ]
        },
        {
            test: /\.scss$/,
            exclude,
            use: [
                {
                    loader: require.resolve('to-string-loader'),
                },
                {
                    loader: require.resolve('css-loader'),
                },
                {
                    loader: require.resolve('postcss-loader'), options: autoprefixerOptions,
                },
                {
                    loader: require.resolve('sass-loader'),
                }
            ]
        },
        {
            test: /\.css$/,
            exclude,
            use: [
                {
                    loader: require.resolve('style-loader'),
                },
                {
                    loader: require.resolve('css-loader'),
                },
                {
                    loader: require.resolve('postcss-loader'), options: autoprefixerOptions,
                },
            ]
        },
        {
            test: /\.tpl$/,
            exclude,
            use: [ require.resolve('art-template-loader'), ],
        },
        {
            test: /\.html$/,
            exclude,
            use: [ require.resolve('html-loader'), ],
        },
        {
            test: /\.vue$/,
            exclude,
            loader: require.resolve('vue-loader'),
            options: {
                loaders: {
                    scss: vueScssLoadersString,
                    sass: vueSassLoadersString,
                    js: {
                        loader: require.resolve('babel-loader'),
                        options: babelOptions,
                    },
                },
                preserveWhitespace: false,
                postcss: [ autoprefixer( { browsers: [ '> 0.01%' ] } ) ],
                // TODO: markup-inline-loader
            },
        },
    ];

    if ( isESNext ) {
        rules.push(
            {
                test: /\.*(js|jsx)$/,
                exclude,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: babelOptions,
                    },
                ]
            },
            {
                test: /\.*(ts|tsx)$/,
                exclude,
                use: [
                    {
                        loader: require.resolve('awesome-typescript-loader'),
                        options: {
                            silent: true,
                            configFileName: getTsConfigJson( config ),
                            useBabel: true,
                            babelCore: require.resolve('@babel/core'),
                            babelOptions: {
                                babelrc: false,
                                presets: babelOptions.presets,
                                plugins: babelOptions.plugins,
                            },
                        },
                    },
                ],
            }
        );
    }

    return rules;
};
