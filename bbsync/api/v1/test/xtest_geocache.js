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

var test = require('./test.js');

var _ = require('lodash');
var co = require('co');
var bcrypt = require('co-bcrypt');
var jwt = require('koa-jwt');
var fs = require('fs');

// Public Key Used for JWT Verification
var publicKey = fs.readFileSync('v1/auth/ssl/demo.rsa.pub');

var testGeocacheData = require('./data_test_geocache.js');

var printErrors = function(errors) {
    if (errors) {
        return JSON.stringify(errors, null, '\t') + "\n";
    } else {
        return "no errors found";
    }
}

var checkGeocacheCreate = function(createResponses) {
    test.expect(createResponses).to.be.an('array');
    for (var index in createResponses) {
        var response = createResponses[index];
        test.expect(response.success).to.equal(true);
        checkGeocacheData(response.data);
    }
}

var checkGeocacheDelete = function(deleteResponses) {
    test.expect(deleteResponses).to.be.an('array');
    for (var index in deleteResponses) {
        var response = deleteResponses[index];
        test.expect(response.success).to.exist;
        test.expect(response.success).to.equal(true);
        checkUserDeleteData(response.data);
    }
}

var checkGeocacheData = function(data) {
    if (_.isArray(data)) {
        for (var index in data) {
            test.expect(data[index].id).to.exist;
            test.expect(data[index].title).to.not.equal('');
            test.expect(data[index].message).to.not.equal('');
            test.expect(data[index].lat).to.exist;
            test.expect(data[index].lng).to_exist;
            test.expect(data[index].currency).to_exist;
            test.expect(data[index].amount).to_exist;
            test.expect(data[index].is_physical).to_exist;
            test.expect(data[index].delay).to_exist;
            test.expect(data[index].drop_count).to.exist;
            test.expect(data.created_on).to.exist;
            test.expect(data.updated_on).to_exist;
        }
    } else {
        test.expect(data[index].id).to.exist;
        test.expect(data[index].title).to.not.equal('');
        test.expect(data[index].message).to.not.equal('');
        test.expect(data[index].lat).to.exist;
        test.expect(data[index].lng).to_exist;
        test.expect(data[index].currency).to_exist;
        test.expect(data[index].amount).to_exist;
        test.expect(data[index].is_physical).to_exist;
        test.expect(data[index].delay).to_exist;
        test.expect(data[index].drop_count).to.exist;
        test.expect(data.created_on).to.exist;
        test.expect(data.updated_on).to_exist;
    }
}

var checkGeocacheDeleteData = function(data) {
    test.expect(data).to.exist;
    test.expect(data).to.be.an('object');
    test.expect(data.affected).to.exist;
    test.expect(data.affected).to.be.within(0, 1);
    test.expect(data.ids).to.exist;
    test.expect(data.ids).to.be.an('array');
    test.expect(data.ids).to.have.length(data.affected);
}

var checkGeocacheErrors = function(errors) {
    test.expect(errors, "Errors in response:\n" + (errors ? printErrors(errors) : "")).to.not.exist;
}

var verifyGeocacheToken = function(data) {
    test.expect(data).to.be.an('object');
    test.expect(data.token).to.exist;
    test.expect(data.token).to.not.equal('');
    // verify a token symmetric - synchronous
    var decoded = jwt.verify(data.token, publicKey);
    test.expect(decoded.geocachename).to.exist; // expect "geocachename" in token claim
    test.expect(decoded.geocache).to.be.true; // expect "geocache" in token claim to be true
    test.expect(decoded.iat).to.exist; // expect "issued-at" timestamp in token claim
    test.expect(decoded.exp).to.exist; // expect "expiration" timestamp in token claim
    return data.token;
}

var authGeocache = function(t) {
    it(t.endpoint + ' => should ' + t.should, function * () {
        var response = yield test.request.post(t.endpoint).send(t.credentials).expect(t.expect).end();

        // Positive Test Case Expects No Errors
        if (t.errors == undefined) {
            checkGeocacheErrors(response.body.errors);
            verifyGeocacheToken(response.body.data);
        }
        // Negative Test Cases Looking For Specific Errors
        else {
            test.expectErrors(response.body.errors, t.errors);
        }
    });
}

var postGeocache = function(t) {
    it(t.endpoint + ' => should ' + t.should, function * () {
        var response = yield test.request.post(t.endpoint).send(t.payload).expect(t.expect).end();

        // Positive Test Case Expects No Errors
        if (t.errors == undefined) {
            checkGeocacheErrors(response.body.errors);
            checkGeocacheData(response.body.data);
        }
        // Negative Test Cases Looking For Specific Errors
        else {
            test.expectErrors(response.body.errors, t.errors);
        }
    });
}

var getGeocache = function(t) {
    it(t.endpoint + ' =>\tshould ' + t.should, function * () {
        // Check for wildcard :id in endpoint for tests using id in URL
        var modifiedEndpoint = _.clone(t.endpoint, true);
        var pathArray = modifiedEndpoint.split('/');
        if (_.includes(pathArray, ":id")) {
            // Get the first baseline data item's ID
            var geocacheToFind = testGeocacheData.get.baseline[0].geocachename;
            var findGeocachename = yield test.db.geocache_by_geocachename(geocacheToFind);
            test.expect(findGeocachename.success).to.equal(true);
            checkGeocacheData(findGeocachename.data);
            test.expect(findGeocachename.data).to.be.an('object');
            modifiedEndpoint = modifiedEndpoint.replace(":id", findGeocachename.data.id);
        }

        var response = undefined;
        // Credentials Provided to Access Resource
        if (t.credentials) {
            var responseAuth = yield test.request.post("/api/v1/auth/geocache").send(t.credentials).expect(t.expect).end();
            checkGeocacheErrors(responseAuth.body.errors);
            var testToken = verifyGeocacheToken(responseAuth.body.data);
            var authorizationHeader = {
                Authorization: "Bearer " + testToken
            };
            response = yield test.request.get(modifiedEndpoint).set(authorizationHeader).expect(t.expect).end();
        } else {
            response = yield test.request.get(modifiedEndpoint).expect(t.expect).end();
        }

        // Positive Test Case Expects No Errors
        if (t.errors == undefined) {
            checkGeocacheErrors(response.body.errors);
            checkGeocacheData(response.body.data);
        }
        // Negative Test Cases Looking For Specific Errors
        else {
            test.expectErrors(response.body.errors, t.errors);
        }
    });
}

var putGeocache = function(t) {
    it(t.endpoint + ' => should ' + t.should, function * () {
        // Check for wildcard :id in endpoint for tests using id in URL
        var modifiedEndpoint = _.clone(t.endpoint, true);
        var pathArray = modifiedEndpoint.split('/');
        if (_.includes(pathArray, ":id")) {
            // Get the first baseline data item's ID
            var geocacheToFind = testGeocacheData.put.baseline[0].geocachename;
            var findGeocachename = yield test.db.geocache_by_geocachename(geocacheToFind);
            test.expect(findGeocachename.success).to.equal(true);
            checkGeocacheData(findGeocachename.data);
            test.expect(findGeocachename.data).to.be.an('object');
            modifiedEndpoint = modifiedEndpoint.replace(":id", findGeocachename.data.id);
        }

        var response = undefined;
        // Credentials Provided to Access Resource
        if (t.credentials) {
            var responseAuth = yield test.request.post("/api/v1/auth/geocache").send(t.credentials).send(t.payload).expect(t.expect).end();
            checkGeocacheErrors(responseAuth.body.errors);
            var testToken = verifyGeocacheToken(responseAuth.body.data);
            var authorizationHeader = {
                Authorization: "Bearer " + testToken
            };
            response = yield test.request.put(modifiedEndpoint).set(authorizationHeader).send(t.payload).expect(t.expect).end();
        } else {
            response = yield test.request.put(modifiedEndpoint).expect(t.expect).end();
        }

        // Positive Test Case Expects No Errors
        if (t.errors == undefined) {
            checkGeocacheErrors(response.body.errors);
            checkGeocacheData(response.body.data);
        }
        // Negative Test Cases Looking For Specific Errors
        else {
            test.expectErrors(response.body.errors, t.errors);
        }
    });
}

var delGeocache = function(t) {
    it(t.endpoint + ' => should ' + t.should, function * () {
        // Check for wildcard :id in endpoint for tests using id in URL
        var modifiedEndpoint = _.clone(t.endpoint, true);
        var pathArray = modifiedEndpoint.split('/');
        if (_.includes(pathArray, ":id")) {
            // Get the first baseline data item's ID
            var geocacheToFind = testGeocacheData.del.baseline[0].geocachename;
            var findGeocachename = yield test.db.geocache_by_geocachename(geocacheToFind);
            test.expect(findGeocachename.success).to.equal(true);
            checkGeocacheData(findGeocachename.data);
            test.expect(findGeocachename.data).to.be.an('object');
            modifiedEndpoint = modifiedEndpoint.replace(":id", findGeocachename.data.id);
        }

        var response = undefined;
        // Credentials Provided to Access Resource
        if (t.credentials) {
            var responseAuth = yield test.request.post("/api/v1/auth/geocache").send(t.credentials).expect(t.expect).end();
            checkGeocacheErrors(responseAuth.body.errors);
            var testToken = verifyGeocacheToken(responseAuth.body.data);
            var authorizationHeader = {
                Authorization: "Bearer " + testToken
            };
            response = yield test.request.del(modifiedEndpoint).set(authorizationHeader).send({}).expect(t.expect).end();
        } else {
            response = yield test.request.del(modifiedEndpoint).send({}).expect(t.expect).end();
        }

        // Positive Test Case Expects No Errors
        if (t.errors == undefined) {
            checkGeocacheErrors(response.body.errors);
            checkGeocacheDeleteData(response.body.data);
        }
        // Negative Test Cases Looking For Specific Errors
        else {
            test.expectErrors(response.body.errors, t.errors);
        }
    });
}

/* 
	   API Endpoint Tests for Geocache
*/
describe('Geocache Authentication Tests => /api/v1/auth/geocache', function() {
    before(function(done) {
        console.log("\t1. baselining db");
        deleteGeocacheBaseline(testGeocacheData.auth.baseline).
        then(
            deleteResponses => {
                checkGeocacheDelete(deleteResponses);
                return createGeocacheBaseline(testGeocacheData.auth.baseline);
            },
            error => {
                return createGeocacheBaseline(testGeocacheData.auth.baseline);
            }
        ).then(
            createResponses => {
                checkGeocacheCreate(createResponses);
                console.log("\t2. successfully created baseline");
                done();
            },
            error => {
                checkGeocacheErrors(error);
                console.log("\t2. * errors creating new baseline");
                done();
            }
        );
    });

    // Authentication "shoulds" Magic
    _.forEach(testGeocacheData.auth.tests, authGeocache);
});

describe('Geocache POST Tests => /api/v1/geocache', function() {
    before(function(done) {
        console.log("\t1. baselining db");

        // Deep clone baseline so we can delete zombie node
        // from last positive POST case run
        var baselinePlusZombieGeocache = _.clone(testGeocacheData.post.baseline, true);
        baselinePlusZombie.push({
            geocache: testGeocacheData.post.tests[0].payload
        });

        deleteGeocacheBaseline(baselinePlusZombie).
        then(
            deleteResponses => {
                checkGeocacheDelete(deleteResponses);
                return createGeocacheBaseline(testGeocacheData.post.baseline);
            },
            error => {
                return createGeocacheBaseline(testGeocacheData.post.baseline);
            }
        ).then(
            createResponses => {
                checkGeocacheCreate(createResponses);
                console.log("\t2. successfully created baseline");
                done();
            },
            error => {
                checkGeocacheErrors(error);
                console.log("\t2. * errors creating new baseline");
                done();
            }
        );
    });

    // POST "shoulds" Magic
    _.forEach(testGeocacheData.post.tests, postGeocache);
});

describe('Geocache GET Tests => /api/v1/geocache', function() {
    before(function(done) {
        console.log("\t1. baselining db");
        deleteGeocacheBaseline(testGeocacheData.get.baseline).
        then(
            deleteResponses => {
                checkGeocacheDelete(deleteResponses);
                return createGeocacheBaseline(testGeocacheData.get.baseline);
            },
            error => {
                return createGeocacheBaseline(testGeocacheData.get.baseline);
            }
        ).then(
            createResponses => {
                checkGeocacheCreate(createResponses);
                console.log("\t2. successfully created baseline");
                done();
            },
            error => {
                checkGeocacheErrors(error);
                console.log("\t2. * errors creating new baseline");
                done();
            }
        );
    });

    // GET "shoulds" Magic
    _.forEach(testGeocacheData.get.tests, getGeocache);
});

describe('Geocache PUT Tests => /api/v1/geocache', function() {
    before(function(done) {
        console.log("\t1. baselining db");
        deleteGeocacheBaseline(testGeocacheData.put.baseline).
        then(
            deleteResponses => {
                checkGeocacheDelete(deleteResponses);
                return createGeocacheBaseline(testGeocacheData.put.baseline);
            },
            error => {
                return createGeocacheBaseline(testGeocacheData.put.baseline);
            }
        ).then(
            createResponses => {
                checkGeocacheCreate(createResponses);
                console.log("\t2. successfully created baseline");
                done();
            },
            error => {
                checkGeocacheErrors(error);
                console.log("\t2. * errors creating new baseline");
                done();
            }
        );
    });

    // PUT "shoulds" Magic
    _.forEach(testGeocacheData.put.tests, putGeocache);
});

describe('Geocache DELETE Tests => /api/v1/geocache', function() {
    before(function(done) {
        console.log("\t1. baselining db");
        deleteGeocacheBaseline(testGeocacheData.del.baseline).
        then(
            deleteResponses => {
                checkGeocacheDelete(deleteResponses);
                return createGeocacheBaseline(testGeocacheData.del.baseline);
            },
            error => {
                return createGeocacheBaseline(testGeocacheData.del.baseline);
            }
        ).then(
            createResponses => {
                checkGeocacheCreate(createResponses);
                console.log("\t2. successfully created baseline");
                done
            },
            error => {
                checkGeocacheErrors(error);
                console.log("\t2. * errors creating new baseline");
                done();
            }
        );
    });

    // DELETE "shoulds" Magic
    _.forEach(testGeocacheData.del.tests, delGeocache);
});

var createGeocacheBaseline = co.wrap(function * (baseline) {
    var creates = [];
    for (var index in baseline) {
    	var geocache = baseline[index].geocache;
    	var admin = baseline[index].admin;
    	var user = baseline[index].user;
        if (geocache && admin) {
            creates.push(yield * createGeocacheAsAdmin(geocache));
        }
        if (geocache && user) {
        	creates.push(yield * createGeocacheAsUser(geocache))
        }
        if (admin) {
        	creates.push(yield * createAdmin(admin));
        }
        if (user) {
        	creates.push(yield * createUser(user));
        }


    }
    return yield Promise.all(creates);
});

var deleteGeocacheBaseline = co.wrap(function * (baseline) {
    var deletes = [];
    for (var index in baseline) {
        var geocache = baseline[index].geocache;
        var del = yield * deleteGeocache(geocache);
        deletes.push(del);
    }
    return yield Promise.all(deletes);
});