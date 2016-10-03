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

/**
 * Baby Sync API Version 1
 * @module babysync/api/V1 
 */

/** Bootstrap for Baby Sync API and Web UI Applications */
module.exports = function V1() {

    // koa packages
    var koa = require('koa');
    var logger = require('koa-logger');
    var mount = require('koa-mount');
    var compose = require('koa-compose');

    // Static Content
    var StaticContent = require('./StaticContent.js');
    var staticContent = new StaticContent();

    // BabySync API
    var BabySync    = require('./BabySync.js');
    var babySync = null;

    // Web Routing
    var Web = require('./Web.js');
    var web = new Web(staticContent);

    // Koa 
    var app = koa();

    // Development Switch
    if (app.env === 'development') {
        // NODE_ENV = 'development'
        // Use Development Logger
        // app.use(logger());
        // Use Dev Error Handler
        // ???
    }

    // Define BabySync API operations for environment stated
    babySync = new BabySync(app.env);

    // Make static content available in 'public' folder
    app.use(staticContent.cache);

    // Custom 401 handling (avoids exposing koa-jwt errors to user)
    app.use(babySync.utility.response.custom401);

    // Mount public routes (do not require valid JWT)
    app.use(mount('/api/v1', babySync.public));

    // Mount public web pages for Angular.js front end
    app.use(mount('/web', web));

    // Mount private routes (require valid JWT)
    app.use(mount('/api/v1', compose([babySync.utility.security.checkJWT, babySync.private])));

    return app;
};