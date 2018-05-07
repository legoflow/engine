'use strict';

const path = require('path');

module.exports = ( config ) => {
    const { alias, projectPath, root } = config;

    return {
        alias,
        modules: [
            path.resolve( root, './node_modules' ),
        ],
        extensions: [
            '.js', '.ts', '.tsx', '.jsx',
            '.vue', '.art', '.html',
            '.scss', '.css' , '.json',
            '.svg',
        ],
    };
};
