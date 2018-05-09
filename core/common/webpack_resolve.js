'use strict';

const path = require('path');

module.exports = ( config ) => {
    let { alias, projectPath, root, includeModules } = config;

    if ( !includeModules ) {
        includeModules = [ ];
    }

    return {
        alias,
        modules: [
            path.resolve( root, './node_modules' ),
            ...includeModules,
        ],
        extensions: [
            '.js', '.ts', '.tsx', '.jsx',
            '.vue', '.art', '.html',
            '.scss', '.css' , '.json',
            '.svg',
        ],
    };
};
