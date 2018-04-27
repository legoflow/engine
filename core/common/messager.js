'use strict';

const chalk = require('chalk');

module.exports = class Messager {
    static sender ( { type, msg } ) {
        let color = msg => msg;

        switch ( type ) {
            case 'error': {
                color = chalk.red;
                break;
            }
            case 'success': {
                color = chalk.green.bold;
                break;
            }
            case 'stop': {
                color = chalk.yellow;
                break;
            }
            case 'notice': {
                color = chalk.blue;
                break;
            }
        }

        console.log( color( `[${ type }]` ), color( msg ) );
    }

    log ( msg ) {
        Messager.sender( { type: 'log', msg } );
    }

    error ( msg ) {
        Messager.sender( { type: 'error', msg } );
    }

    success ( msg ) {
        Messager.sender( { type: 'success', msg } );
    }

    stop ( msg ) {
        Messager.sender( { type: 'stop', msg } );
    }

    notice ( msg ) {
        Messager.sender( { type: 'notice', msg } );
    }
};
