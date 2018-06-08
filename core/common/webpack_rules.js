'use strict';

const path = require('path');
const autoprefixer = require('autoprefixer');
const glob = require('glob');

const getTsConfigJson = require('../common/get_tsconfig_json');
const babelOptions = require('../common/babel_options');

module.exports = ( config ) => {
    const isESNext = config[ 'ES.Next' ];

    const { workflow, root, projectPath, ESLint, alias } = config;

    const workflowConfig = config[ `workflow.${ workflow }` ] || { };

    const limitSize = ( workflow == 'build' && workflowConfig[ 'bundle.limitResourcesSize' ] ) ? workflowConfig[ 'bundle.limitResourcesSize' ] : 1024 * 100;

    const appNodeModules = path.resolve( root, './node_modules' );

    const exclude = [ appNodeModules ];

    const postcssOptions = {
        sourceMap: true,
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
        {
            loader: require.resolve( 'vue-style-loader' ),
            options: { sourceMap: true },
        },
        {
            loader: require.resolve('css-loader'),
            options: {
                importLoaders: 1,
                modules: true,
                localIdentName: '[local]_[hash:base64:8]',
                sourceMap: true,
            },
        },
        {
            loader: require.resolve('postcss-loader'),
            options: postcssOptions,
        },
    ];

    const cssRuleUse = [
        {
            loader: require.resolve( 'vue-style-loader' ),
            options: { sourceMap: true },
        },
        {
            loader: require.resolve('css-loader'),
            options: {
                importLoaders: 1,
                sourceMap: true,
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
            sourceMap: true,
        },
    } ] );

    const scssRuleUse = cssRuleUse.concat( [ {
        loader: require.resolve('sass-loader'),
        options: {
            sourceMap: true,
        },
    } ] );

    const rules = [
        {
            test: /\.(png|jpg|gif|jpeg|svg)$/,
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

        tsRule = {
            test: /\.*(ts|tsx)$/,
            exclude,
            use: [
                {
                    loader: require.resolve('babel-loader'),
                    options: babelOptions,
                },
                {
                    loader: require.resolve('ts-loader'),
                    options: {
                        configFile: getTsConfigJson( config ),
                        context: projectPath,
                        allowTsInNodeModules: true,
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
            test: /\.(js|vue)$/,
            exclude,
            use: [ eslintRule ],
        } )

        jsRule && jsRule.use.push( eslintRule );
        tsRule && tsRule.use.push( eslintRule );
    }

    jsRule && rules.push( jsRule );
    tsRule && rules.push( tsRule );

    rules.push( vueRule );

    return rules;
};
