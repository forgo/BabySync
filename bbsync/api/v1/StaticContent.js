// The MIT License (MIT)

// Copyright (c) 2015 Elliott Richerson

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

module.exports = function StaticContent() {

    var Q = require('q');

    var path = require('path');
    var staticCache = require('koa-static-cache');

    var staticPrefix = "/public";

    // Public Static Content Path Constant
    var publicPath = path.join(__dirname, staticPrefix);

    // Create Promise for Serving Files Without Templating Engine
    var readFilePromise = function(src) {
        var deferred = Q.defer();
        var srcPath = path.join(publicPath, src);
        fs.readFile(srcPath, {'encoding': 'utf8'}, function(error, data) {
            if(error) deferred.reject(error);
            else deferred.resolve(data);
        });
        return deferred.promise;
    };

    var options = {
        dir: publicPath,
        maxAge: 60 * 60 * 24 * 365,
        cacheControl: "",
        buffer: true,
        gzip: true,
        alias: {},
        prefix: staticPrefix,
        dynamic: true
    };

    var files = {};

    var staticContent = {
        cache: staticCache(path.join(__dirname, staticPrefix), options, files),
        readFilePromise: readFilePromise
    };
    return staticContent;
};