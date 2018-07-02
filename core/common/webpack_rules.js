'use strict';

const path = require('path');
const autoprefixer = require('autoprefixer');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const babelOptions = require('../common/babel_options');

module.exports = ( config ) => {
    const isESNext = config[ 'ES.Next' ];

    const { workflow, root, projectPath, ESLint, alias, isTS, cacheFlag } = config;

    const workflowConfig = config[ `workflow.${ workflow }` ] || { };

    const webpackImageQuality = config.webpack ? ( config.webpack.imageQuality || 90 ) : 90;

    const { publicPath } = workflowConfig;

    const isBuildWorkflow = config.workflow === 'build';

    const limitSize = ( workflow == 'build' && workflowConfig[ 'bundle.limitResourcesSize' ] ) ? workflowConfig[ 'bundle.limitResourcesSize' ] : 1024 * 100;

    const appNodeModules = path.resolve( root, './node_modules' );
    const localNodeModules = path.resolve( projectPath, './node_modules' );

    const exclude = [ appNodeModules, localNodeModules ];

    const postcssOptions = {
        sourceMap: isBuildWorkflow,
        plugins: ( ) => [
            require('autoprefixer')( {
                browsers: [ '> 0.01%', ],
            } )
        ],
    }

    const inlineSvgLoader = {
        loader: require.resolve('markup-inline-loader'),
        options: {
            strict: 'inline',
            svgo: {
                plugins: [
                    { removeTitle: true },
                    { removeUselessStrokeAndFill: false },
                    { removeUnknownsAndDefaults: true },
                    { removeStyleElement: true },
                ],
            },
        }
    }

    const vueRule = {
        test: /\.vue$/,
        exclude,
        use: [
            {
                loader: require.resolve('vue-loader'),
                options: {
                    compilerOptions: {
                        preserveWhitespace: false,
                    },
                },
            },
            inlineSvgLoader,
        ]
    }

    const cssModulesRuleUse = [
        config.workflow === 'build' && config.mode === 'webpack' ?
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: publicPath || './',
            },
        }
        :
        {
            loader: require.resolve( 'vue-style-loader' ),
            options: {
                sourceMap: isBuildWorkflow,
            },
        },
        {
            loader: require.resolve('css-loader'),
            options: {
                importLoaders: 1,
                modules: true,
                localIdentName: '[local]_[hash:base64:8]',
                sourceMap: isBuildWorkflow,
            },
        },
        {
            loader: require.resolve('postcss-loader'),
            options: postcssOptions,
        },
    ];

    const cssRuleUse = [
        config.workflow === 'build' && config.mode === 'webpack' ?
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                publicPath: publicPath || './',
            },
        }
        :
        {
            loader: require.resolve( 'vue-style-loader' ),
            options: {
                sourceMap: isBuildWorkflow
            },
        },
        {
            loader: require.resolve('css-loader'),
            options: {
                importLoaders: 1,
                sourceMap: isBuildWorkflow,
            },
        },
        {
            loader: require.resolve('postcss-loader'),
            options: postcssOptions,
        },
    ];

    const scssModulesRuleUse = cssModulesRuleUse.concat( [ {
        loader: require.resolve('sass-loader'),
        options: {
            sourceMap: isBuildWorkflow,
        },
    } ] );

    const scssRuleUse = cssRuleUse.concat( [ {
        loader: require.resolve('sass-loader'),
        options: {
            sourceMap: isBuildWorkflow,
        },
    } ] );

    const filesName = cacheFlag ? `[name].${ cacheFlag }.[ext]` : '[name].[ext]';

    const imageRule = {
        test: /\.(png|jpg|gif|jpeg|svg)$/,
        exclude,
        use: [
            {
                loader: require.resolve('url-loader'),
                options: {
                    limit: 1024 * limitSize,
                    name: `../img/${ filesName }`,
                    root: 'img',
                },
            },
        ],
    }

    if ( config.workflow === 'build' && config.mode === 'webpack' ) {
        imageRule.use.push( {
            loader: require.resolve('image-webpack-loader'),
            options: {
                mozjpeg: {
                    progressive: true,
                    quality: webpackImageQuality,
                },
                optipng: {
                    enabled: false,
                },
                pngquant: {
                    quality: webpackImageQuality,
                },
                gifsicle: {
                    interlaced: false,
                },
            }
        } )
    }

    const rules = [
        imageRule,
        {
            test: /\.(ttf|woff|otf|eot)$/,
            exclude,
            use: [
                {
                    loader: require.resolve('url-loader'),
                    options: {
                        limit: 1024 * limitSize,
                        name: `../assets/${ filesName }`,
                        root: 'assets',
                    },
                }
            ]
        },
        {
            test: /\.scss$/,
            exclude,
            oneOf: [
                {
                    resourceQuery: /module/,
                    use: scssModulesRuleUse,
                },
                {
                    use: scssRuleUse,
                },
            ],
        },
        {
            test: /\.css$/,
            exclude,
            oneOf: [
                {
                    resourceQuery: /module/,
                    use: cssModulesRuleUse,
                },
                {
                    use: cssRuleUse,
                },
            ],
        },
        {
            test: /\.(tpl|art)$/,
            exclude,
            use: [ require.resolve('art-template-loader'), ],
        },
        {
            test: /\.html$/,
            exclude,
            oneOf: [
                {
                    resourceQuery: /^\?vue/,
                    use: [ ],
                },
                {
                    use: [
                        require.resolve('html-loader'),
                        inlineSvgLoader,
                    ],
                },
            ],
        },
    ];

    let jsRule = void 0;
    let tsRule = void 0;

    if ( isESNext ) {
        jsRule = {
            test: /\.*(js|jsx)$/,
            exclude,
            use: [
                {
                    loader: require.resolve('babel-loader'),
                    options: babelOptions,
                },
            ]
        };
    }

    if ( isTS ) {
        tsRule = {
            test: /\.*(ts)$/,
            exclude,
            use: [
                {
                    loader: require.resolve('babel-loader'),
                    options: babelOptions,
                },
                {
                    loader: require.resolve('ts-loader'),
                    options: {
                        configFile: path.resolve( projectPath, './tsconfig.json' ),
                        context: projectPath,
                        allowTsInNodeModules: true,
                        // transpileOnly: true,
                        appendTsSuffixTo: [ /\.vue$/ ],
                    },
                },
            ],
        }
    }

    if ( ESLint ) {
        const [ eslintConfig ] = glob.sync( path.resolve( projectPath, '.eslintrc.*' ) );

        const eslintRule = {
            loader: require.resolve('eslint-loader'),
            options: {
                configFile: eslintConfig || path.resolve( __dirname, './defalut_eslint.js' ),
                eslintPath: path.resolve( root, './node_modules/eslint' ),
            }
        }

        rules.push( {
            enforce: 'pre',
            test: /\.(js|vue|ts)$/,
            exclude,
            use: [ eslintRule ],
        } )

        // jsRule && jsRule.use.push( eslintRule );
        // tsRule && tsRule.use.push( eslintRule );
    }

    jsRule && rules.push( jsRule );
    tsRule && rules.push( tsRule );

    rules.push( vueRule );

    return rules;
};
