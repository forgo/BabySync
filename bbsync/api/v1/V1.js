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

module.exports = function V1() {

    var bcrypt = require('co-bcrypt');
    var parse = require('co-body');
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');
    var Q = require('q');

    var koa = require('koa');
    var logger = require('koa-logger');
    var staticCache = require('koa-static-cache');
    var mount = require('koa-mount');
    var compose = require('koa-compose');
    var jwt = require('koa-jwt');

    var app = koa();

    // Public Static Content Path Constant
    var publicPath = path.join(__dirname, '/public');

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

    // Make Static Content Available in 'public' Folder
    var options = {
        dir: publicPath,
        maxAge: 60 * 60 * 24 * 365,
        cacheControl: "",
        buffer: true,
        gzip: true,
        alias: {},
        prefix: "/public",
        dynamic: true
    };

    var files = {};

    app.use(staticCache(path.join(__dirname, '/public'), options, files));

    // Development Switches
    if (app.env === 'development') {
        // console.log("NODE_ENV = 'development'");
        // Use Development Logger
        // app.use(logger());
        // Use Error Handler
    }

    var REST = require('./REST.js');

    var Utility = require('./Utility.js');

    var Errors = require('./Errors.js');
    var Validate = require('./Validate.js');

    var WebLogin = require('./web/WebLogin.js');

    var AdminLogin = require('./auth/AdminLogin.js');
    var Admin = require('./admin/Admin.js');

    var UserLogin = require('./auth/UserLogin.js');
    var User = require('./user/User.js');

    //

    var Family = require('./family/Family.js');
    var Parent = require('./parent/Parent.js');
    var Activity = require('./activity/Activity.js');
    var Baby = require('./baby/Baby.js');
    var Timer = require('./timer/Timer.js');


    //

    var Geocache = require('./geocache/Geocache.js');

    var errors = new Errors();
    var db = require('./Database.js')('http://localhost:7474');

    var utility = new Utility(errors);
    var validate = new Validate(errors);

    var webLogin = new WebLogin(readFilePromise);

    var adminLogin = new AdminLogin(db, bcrypt, fs, jwt, parse, errors, validate, utility);
    var admin = new Admin(db, bcrypt, parse, errors, validate, jwt, utility, _);

    var userLogin = new UserLogin(db, bcrypt, fs, jwt, parse, errors, validate, utility);
    var user = new User(db, bcrypt, parse, errors, validate, jwt, utility, _);

    var geocache = new Geocache(db, bcrypt, parse, errors, validate, jwt, utility, _, user.schema);  

///
    var family = new Family(REST, db, validate, errors);
    var parent = new Parent(REST, db, validate, errors);
    var activity = new Activity(REST, db, validate, errors);
    var baby = new Baby(REST, db, validate, errors);
    var timer = new Timer(REST, db, validate, errors);

////

    // Routing
    var Web = require('./Web.js');
    var web = new Web(webLogin);
    var Public = require('./Public.js');
    var pub = new Public(admin, adminLogin, user, userLogin, family, parent);
    var Private = require('./Private.js');
    var pvt = new Private(admin,user,geocache);

    // Custom 401 handling if you don't want to expose koa-jwt errors to users
    app.use(utility.middleware.custom401);



    // Public Routes (do not require valid JWT)
    app.use(mount('/api/v1', pub.middleware()));

        // Public Web Pages for Angular Front End
    app.use(mount('/web', web.middleware()));

    // Public Key Used for JWT Verification
    var publicKey = fs.readFileSync('v1/auth/ssl/demo.rsa.pub');

    // Private Routes (require valid JWT)
    var checkJWT = jwt({
        secret: publicKey,
        algorithm: 'RS256',
        key: 'jwtdata'
    })
    app.use(mount('/api/v1', compose([checkJWT, pvt.middleware()])));

    return app;
};