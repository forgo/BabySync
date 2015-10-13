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

module.exports = function DB(config) {

    var neo4j = require('neo4j');
    var ndb = new neo4j.GraphDatabase('http://neo4j:Tddktlzv@localhost:7474');
    var Q = require('q');
    var _ = require('lodash');

    var errors = require('./Errors.js')();

    var adminDB = require('./admin/AdminDB.js')();
    var userDB = require('./user/UserDB.js')();
    var geocacheDB = require('./geocache/GeocacheDB.js')();

    var familyDB = require('./family/FamilyDB.js')();
    var parentDB = require('./parent/ParentDB.js')();
    var babyDB = require('./baby/BabyDB.js')();
    var activityDB = require('./activity/ActivityDB.js')();
    var timerDB = require('./timer/TimerDB.js')();

    var db = {
        ndb: ndb,
        cypher: function(input) {
            // console.log("----------------------");
            // console.log("EXECUTING CYPHER QUERY");
            // console.log(input);
            // console.log("----------------------");
            var deferred = Q.defer();
            ndb.cypher(input, function(error, results) {
                if (error) deferred.reject(error);
                else deferred.resolve(results);
            });

            return deferred.promise;
        },
        successOneOrNone: function(results) {
            var response = {};
            var deferred = Q.defer();

            if (!results) {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            } else if (results.length > 1) {

                console.log("results elliott = ", results);
                console.log("resutls length = ", results.length);

                response.success = false;
                response.errors = [errors.NEO4J_EXPECTED_ONE_RESULT()];
                deferred.reject(response);
            } else {
                response.success = true;
                if (results.length == 0) {
                    response.data = results;
                } else {
                    response.data = results[0];
                }
                deferred.resolve(response);
            }
            return deferred.promise;
        },
        successOneOrMany: function(results) {
            var response = {};
            var deferred = Q.defer();
            if (!results) {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            } else if (results.length == 0) {
                response.success = false;
                response.errors = [errors.NEO4J_EXPECTED_RESULT()];
                deferred.reject(response);
            } else {
                response.success = true;
                response.data = results;
                deferred.resolve(response);
            }
            return deferred.promise;
        },
        successTaken: function(results) {
            var response = {};
            var deferred = Q.defer();
            if (!results) {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            } else if (results.length > 0) {
                response.success = true;
                response.taken = true;
                deferred.resolve(response);
            } else if (results.length == 0) {
                response.success = true;
                response.taken = false;
                deferred.resolve(response);
            } else {
                response.success = false;
                response.errors = [errors.NEO4J_ERROR()];
                deferred.reject(response);
            }
            return deferred.promise;
        },
        success: function(results) {
            var response = {};
            var deferred = Q.defer();
            if (!results) {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            } else if (results.length == 0) {
                response.success = false;
                response.errors = [errors.NEO4J_EMPTY_RESULT()];
                deferred.reject(response);
            } else {
                response.success = true;
                response.data = results;
                deferred.resolve(response);
            }
            return deferred.promise;
        },
        successAll: function(results) {
            var response = {};
            var deferred = Q.defer();
            if (!results) {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            } else if (results.length >= 0) {
                response.success = true;
                response.data = results;
                deferred.resolve(response);
            } else {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            }
            return deferred.promise;
        },
        successDelete: function(results) {
            var response = {};
            var deferred = Q.defer();
            if (!results) {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            } else {
                if (results.length == 0) {
                    response.success = true;
                    response.data = results[0];
                } else {
                    response.success = true;
                    response.data = results[0];
                }
                deferred.resolve(response);
            }
            return deferred.promise;
        },
        error: function(err) {
            var response = {};
            var deferred = Q.defer();
            response.success = false;

            // Database Connectivity Issue
            if (err.code == "ECONNREFUSED") {
                response.errors = [errors.NEO4J_CONNECTION_ISSUE()];
            }
            // Malformed Cypher Query
            else if (err.neo4j) {
                if (err.neo4j.code && err.neo4j.code == "Neo.ClientError.Statement.InvalidSyntax") {
                    response.errors = [errors.NEO4J_MALFORMED_QUERY()];
                } else if (err.neo4j.code && err.neo4j.code == "Neo.ClientError.Schema.ConstraintViolation") {
                    response.errors = [errors.NEO4J_CONSTRAINT_VIOLATION()];
                } else if (err.neo4j.code) {
                    //console.log(err.neo4j.message)
                    response.errors = [errors.NEO4J_ERROR(err.neo4j.code)];
                } else {
                    response.errors = [errors.NEO4J_ERROR()];
                }
            } else {
                // Unknown Error
                response.errors = [errors.UNKNOWN_ERROR("Database --- " + err)]
            }

            deferred.reject(response);
            return deferred.promise;
        }
    };

    // Merge Database Utility Functions for Models
    _.merge(db, adminDB);
    _.merge(db, userDB);

    _.merge(db, geocacheDB);

    _.merge(db, familyDB);
    _.merge(db, parentDB);
    _.merge(db, babyDB);
    _.merge(db, activityDB);
    _.merge(db, timerDB);

    return db;
}