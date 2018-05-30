'use strict';

const fs = require('fs-extra');
const util = require('../../util');

module.exports = ( shell, config, messager ) => {
    delete require.cache[ shell ];

    shell = require( shell );

    const { nodeBin } = config;

    const pull = ( module ) => {
        return require( `${ config.root }/node_modules/${ module }` );
    }

    const nodeBinExec =  ( root, file, callback ) => {
        if ( !nodeBin || ( nodeBin && !fs.existsSync( nodeBin ) ) ) {
            messager.stop( 'node bin undefined.' );

            return void 0;
        }

        shell.cd( root );

        shell.exec( `${ nodeBin } ${ file }`, callback );
    }

    if ( shell.before || shell.after ) {
        return {
            async before ( ) {
                messager.log( 'start to exec shell.before' );

                await shell.before( { config, messager, nodeBinExec, util, pull } );
            },
            async after ( ) {
                messager.log( 'start to exec shell.after' );

                await shell.after( { config, messager, nodeBinExec, util, pull } );
            },
        };
    }
    else {
        return async ( ) => {
            messager.log( 'start to exec shell' );

            await shell( { config, messager, nodeBinExec, util, pull } );
        };
    }
};
