
var path = require('path');
var crypto = require('crypto');
var fs = require('fs');

var gutil = require('gulp-util');
var through = require('through2');
var Q = require('q');

var PLUGIN_NAME = 'gulp-make-css-url-version';

var getMD5 = function (data) {
    var hash = crypto.createHash("md5");
    hash.update(data);
    var md5Base64 = hash.digest("base64");
    return md5Base64;
};

module.exports = function (options) {
    return through.obj(function (file, enc, cb) {
        options = options || {};
        var self = this;

        const flag = options.flag;

        var fileName = file.path.split(path.sep).pop();

        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }

        //css file only
        if (!/^\.css?$/.test(path.extname(file.path))) {
            gutil.log(gutil.colors.red('[WARN] file ' + fileName + ' is not a css file'));
            this.push(file);
            return cb();
        }

        var html = file.contents.toString();

        var promises = [];

        html = html.replace(/url\("?([^\)"]+)"?\)/g, function (str, url) {

            //url = url.replace(/\?[\s\S]*$/, "").trim(); //font
            url = url.replace(/['"]*/g, "");

            if (url.indexOf('data:image') > -1 || url.indexOf("base64,") > -1 || url.indexOf("about:blank") > -1 || url.indexOf("http://") > -1 || url === '/') {
                return str;
            }

            if ( options.paramType == 'version' ) {
                return "url(" + url + "?v=" + flag + ")";
            } else if ( options.paramType == 'timestamp' ) {
                return "url(" + url + "?t=" + flag + ")";
            } else if ( options.paramType == 'hash' ) {
                return "url(" + url + "?h=" + flag + ")";
            } else {
                return "url(" + url + ")";
            }
        });

        if (options.paramType == 'version' || options.paramType == 'timestamp' || options.paramType=='hash') {
            file.contents = new Buffer(html);
            self.push(file);
            cb();
            return;
        }

        Q.all(promises).then(function (mathces) {

            mathces.forEach(function (match) {
                html = html.replace(match.key, match.value);
            });

            file.contents = new Buffer(html);
            self.push(file);
            cb();
        });

    });
};
