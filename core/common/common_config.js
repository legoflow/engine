'use strict';

const path = require('path');
const _ = require('lodash');

const resolve = ( _config_ ) => {
    let config = _.cloneDeep( _config_ );

    const { projectPath, root, env, user, workflow } = config;

    config.path = projectPath.pathNorm( );
    config.projectPath = projectPath.pathNorm( );

    if ( !config.system ) {
        config.system = process.platform === 'win32' ? 'win' : 'mac';
    }

    const workflowConfig = config[ `workflow.${ workflow }` ] || { };

    const defaultAlias  = {
        js: `${ projectPath }/src/js/`,
        '@local': `${ projectPath }/node_modules`,
        '@tpl/helper': `${ root }/node_modules/art-template/lib/runtime`,
    };

    const nowENV = workflowConfig[ 'env' ] || workflow;

    if ( typeof env !== 'undefined' && typeof env[ nowENV ] !== 'undefined' ) {
        const __config__ = env[ nowENV ];

        for ( let key in __config__ ) {
            const value = __config__[ key ];

            if ( !config[ key ] || typeof config[ key ] !== 'object' ) {
                config[ key ] = value;
            }
            else {
                config[ key ] = _.merge( config[ key ], value );
            }
        }
    }

    // to absolute path
    for ( let item in config.alias ) {
        if ( typeof config.alias[ item ] === 'string' && config.alias[ item ].indexOf( './' ) === 0 ) {
            config.alias[ item ] = path.resolve( projectPath, config.alias[ item ] );
        }
    }

    // 用户自定义开发参数
    let args = {
        'process.env': `"${ workflow }"`,
        'process.environment': `"${ nowENV }"`,
        'process.args': { },
    }

    const envUserArgs = workflowConfig[ 'user.args' ];

    if ( typeof envUserArgs != 'undefined' ) {
        for ( let key in envUserArgs ) {
            if ( key === user || key == '*' ) {
                args[ 'process.args' ] = _.assign( args[ 'process.args' ], envUserArgs[ key ] );
            }
        }
    }

    config.args = args;

    return config;
}

module.exports = ( _config_, messager ) => {
    try {
        return resolve( _config_ );
    } catch ( e ) {
        console.error( '[COMMON_CONFIG]: ', e );

        messager.stop( '配置文件解析错误' );
    }
};
