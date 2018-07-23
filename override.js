#!/usr/bin/env node

const del = require('del');
const fs = require('fs');
const path = require('path');

console.log( '---- after-install ----' );

const gulpSassNodeSass = path.resolve(__dirname, '../gulp-sass/node_modules/node-sass');

if (fs.existsSync(gulpSassNodeSass)) {
    del.sync(gulpSassNodeSass, { force: true } );
    console.log('delete gulp-sass/node_modules/node-sass');
}
else {
    console.log('gulp-sass/node_modules/node-sass not exist');
}

console.log( '-------------------' );
