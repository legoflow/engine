'use strict';

const fs = require('fs-extra');
const util = require('../../util');

module.exports = async ( shell, config, messager ) => {
    messager.log( 'start to exec shell' );

    delete require.cache[ shell ];

    shell = require( shell );

    const { nodeBin } = config;

    const nodeBinExec =  ( root, file, callback ) => {
        if ( !nodeBin || ( nodeBin && !fs.existsSync( nodeBin ) ) ) {
            messager.stop( 'node bin undefined.' );

            return void 0;
        }

        shell.cd( root );

        shell.exec( `${ nodeBin } ${ file }`, callback );
    }

    await shell( { config, messager, nodeBinExec, util, } );
};
