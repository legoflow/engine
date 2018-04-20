'use strict';

const override = require('override-modules');

module.exports = async ( nodeModulesPath, overridePath, isDebug = false ) => {
    override.config( {
        debug: isDebug,
        root: nodeModulesPath,
        entry: overridePath,
    } );

    await override.start( );
};
