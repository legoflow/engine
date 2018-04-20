'use strict';

const path = require('path');

const override = require('../override');

( async ( ) => {
    await override(
        path.resolve( __dirname, '../node_modules' ),
        path.resolve( __dirname, '../node_modules_override' ),
        true,
    )

    const engine = require('../index');

    console.log( engine );
} )( );
