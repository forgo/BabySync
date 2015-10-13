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

module.exports = function Private(admin, user, geocache) {

    var Router = require('koa-router');

    // var authController = require('./../controllers/auth');
    // var userController = require('./../controllers/user');

    var Private = new Router();

    // Logout Route
    Private.get('/auth/logout', function * (next) {
        this.body = "authController.logout";
    });

    // Admin Registration Protected (unlike User)
    Private.post('/admin', admin.post);

    // Admin routes
    Private.get('/admin', admin.get);
    Private.get('/admin/:id', admin.get);
    Private.put('/admin', admin.put);
    Private.put('/admin/:id', admin.put);
    Private.del('/admin', admin.del);
    Private.del('/admin/:id', admin.del);

    // User routes
    Private.get('/user', user.get);
    Private.get('/user/:id', user.get);
    Private.put('/user', user.put);
    Private.put('/user/:id', user.put);
    Private.del('/user', user.del);
    Private.del('/user/:id', user.del);

    // Geocache routes
    Private.post('/geocache', geocache.post);
    Private.get('/geocache', geocache.get);
    Private.get('/geocache/:id', geocache.get);
    Private.put('/geocache', geocache.put);
    Private.put('/geocache/:id', geocache.put);
    Private.del('/geocache', geocache.del);
    Private.del('/geocache/:id', geocache.del);

    return Private;
};