'use strict';

module.exports = class Messager {
    static sender ( { type, msg } ) {
        console[ console[ type ] ? type : 'log' ]( `[${ type }]`, `${ msg }` );
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
