'use strict';

module.exports = {
    sender ( { type, msg } ) {
        console[ console[ type ] ? type : 'log' ]( `[${ type }]: `, msg );
    },
    log ( msg ) {
        this.sender( { type: 'log', msg } );
    },
    error ( msg ) {
        this.sender( { type: 'error', msg } );
    },
    success ( msg ) {
        this.sender( { type: 'success', msg } );
    },
    stop ( msg ) {
        this.sender( { type: 'stop', msg } );
    },
    notice ( msg ) {
        this.sender( { type: 'notice', msg } );
    },
};


