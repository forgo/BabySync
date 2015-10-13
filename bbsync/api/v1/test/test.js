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

var app = require('../../server.js');
var db = require('../Database.js')('http://localhost:7474');

var _ = require('lodash');
var bcrypt = require('co-bcrypt');
var request = require('co-supertest').agent(app.listen());

var expect = require('chai').expect;
var assert = require('chai').assert;

var test = {
    app: app,
    db: db,
    request: request,
    expect: expect,
    assert: assert,
    expectErrors: function(errors, expected) {
        expect(errors, "Expected error to exist in response, but none found!").to.exist;
        expect(errors, "Error in response should always be an array.").to.be.an('array');
        expect(errors, "Expected errors in test data should be an array.").to.be.an('array');
        expected.forEach(function(expectedError) {
            var found = _.findWhere(errors, {
                code: expectedError.code
            });
            expect(found, "Expected error code " + expectedError.code + "(" + expectedError.message + ")").to.not.be.undefined;
        });
    },
    createAdmin: function * (testAdmin) {
        // Deep clone test admin reference
        var admin = _.clone(testAdmin, true);

        var salt = yield bcrypt.genSalt(10);
        var hash = yield bcrypt.hash(admin.password, salt);

        // Delete password key/value from post object, replace w/hash
        delete admin.password;
        admin.hash = hash;

        // Add automatic date fields
        var now = new Date();
        admin.created_on = now;
        admin.updated_on = now;
        admin.login_on = "";

        return db.admin_create(admin);
    },
    deleteAdmin: function * (testAdmin) {
        // Deep clone test admin reference
        var admin = _.clone(testAdmin, true);
        return db.admin_delete_by_username(admin.username);
    },
    createUser: function * (testUser) {
        // Deep clone test user reference
        var user = _.clone(testUser, true);

        var salt = yield bcrypt.genSalt(10);
        var hash = yield bcrypt.hash(user.password, salt);

        // Delete password key/value from post object, replace w/hash
        delete user.password;
        user.hash = hash;

        // Add automatic date fields
        var now = new Date();
        user.created_on = now;
        user.updated_on = now;
        user.login_on = "";

        return db.user_create(user);
    },
    deleteUser: function * (testUser) {
        // Deep clone test user reference
        var user = _.clone(testUser, true);
        return db.user_delete_by_username(user.username);
    },
    createGeocacheAsAdmin: function * (testGeocache) {
        // Deep clone test geocache reference
        var geocache = _.clone(testGeocache, true);

        // Add automatic date fields
        var now = new Date();
        geocache.created_on = now;
        geocache.updated_on = now;
        geocache.drop_count = 1;

        return test.db.geocache_create(geocache);
    },
    createGeocacheAsUser: function * (testGeocache) {
        // // Deep clone test geocache reference
        // var geocache = _.clone(testGeocache, true);

        // // Add automatic date fields
        // var now = new Date();
        // geocache.created_on = now;
        // geocache.updated_on = now;
        // geocache.drop_count = 1;

        // return test.db.geocache_create(geocache);
    },
    deleteGeocache: function * (testGeocache) {
        // Deep clone test geocache reference
        // var geocache = _.clone(testGeocache, true);
        // return test.db.geocache_delete_by_geocachename(geocache.geocachename);
    }

};

module.exports = test;