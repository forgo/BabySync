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

module.exports = function StaticContent(config) {

    var Q = require('q');

    var path = require('path');
    var staticCache = require('koa-static-cache');

    // Public Static Content Path Constant
    console.log("CONFIG: ", config);
    var publicPath = path.join(__dirname, config.static.prefix);

    // Create Promise for Serving Files Without Templating Engine
    var readFilePromise = function(src) {
        var deferred = Q.defer();
        var srcPath = path.join(publicPath, src);
        fs.readFile(srcPath, {'encoding': config.static.encoding}, function(error, data) {
            if(error) deferred.reject(error);
            else deferred.resolve(data);
        });
        return deferred.promise;
    };

    var options = {
        dir: publicPath,
        maxAge: config.static.cache.maxAge,
        cacheControl: "",
        buffer: true,
        gzip: true,
        alias: {},
        prefix: config.static.prefix,
        dynamic: true
    };

    var files = {};

    var staticContent = {
        cache: staticCache(path.join(__dirname, config.static.prefix), options, files),
        readFilePromise: readFilePromise
    };
    return staticContent;
};