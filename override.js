'use strict';

const del = require('del');
const path = require('path');
const fs = require('fs-extra');
const override = require('override-modules');

module.exports = async ( nodeModulesPath, overridePath, isDebug = false ) => {
    override.config( {
        debug: isDebug,
        root: nodeModulesPath,
        entry: overridePath,
    } );

    // override modules
    await override.start( );

    // clean gulp-sass/node_modules
    const gulpSassFolder = path.resolve( nodeModulesPath, './gulp-sass/node_modules/node-sass' );

    if ( fs.existsSync( gulpSassFolder ) ) {
        del.sync( gulpSassFolder, { force: true } );
    }
};
