'use strict';

const schema = {
    name: String,
    version: String,
    type: String,
    REM: Boolean,
    'ES.Next': Boolean,
    alias: Object,
    global: Object,
    externals: Object,
    env: Object,
    includeModules: Array,
    'workflow.dev': {
        env: String,
        'watch.reload': Array,
        'user.args': Object,
        proxy: Object,
    },
    'workflow.build': {
        publicPath: String,
        'html.resourcesDomain': String,
        'css.resourcesDomain': String,
        cache: String,
        'user.args': String,
        env: String,
        shell: String,
        onlyRunShell: Boolean,
        'output.webpackStats': Boolean,
    },
}
