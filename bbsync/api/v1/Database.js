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
 * @module babysync/api/Database
 */

/** Bootstrap for Baby Sync API and Web UI Applications */
module.exports = function Database(config, errors) {
    var neo4j = require('neo4j');
    var ndb = new neo4j.GraphDatabase(config);
    var Q = require('q');
    var _ = require('lodash');
    var db = {
        ndb: ndb,
        // ---------------------------------------------------------------------
        // Cypher Async Promises
        // ---------------------------------------------------------------------
        cypher: function(input) {
            console.log("----------------------");
            console.log("EXECUTING CYPHER QUERY");
            console.log(input);
            console.log("----------------------");
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

            console.log("SUCCESS ONE OR NONE reuslts: ");
            console.log(results);

            if (!results) {
                response.success = false;
                response.errors = [errors.NEO4J_UNDEFINED_RESULT()];
                deferred.reject(response);
            } else if (results.length > 1) {
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
        },
        errorFilter: function(label) {
            var response = {};
            var deferred = Q.defer();
            response.success = false;
            response.errors = [errors.FILTER_EXPECTED(label)];
            deferred.resolve(response);
            return deferred.promise;
        },
        // ---------------------------------------------------------------------
        // Helper Functions
        // ---------------------------------------------------------------------
        schemaAttributes: function(schema) {
            var attributes = Array();
            schema.forEach(function(attribute, index) {
                attributes.push(attribute.name);
            });
            return attributes;
        },
        // ---------------------------------------------------------------------
        // User Boilerplate
        // ---------------------------------------------------------------------
        user_return: function(alias, returnSchema) {
            // Always return the user ID
            var returnString = " id(" + alias + ") AS id";

            var attributes = db.schemaAttributes(returnSchema);
            if (!Array.isArray(attributes)) {
                return returnString;
            }

            // Never return password attribute (would be empty due to query)
            var pwIndex = attributes.indexOf("password");
            attributes.splice(pwIndex, 1);

            // Construct remaining return statement from requested properties
            attributes.forEach(function(attr, index) {
                returnString += ", " + alias + "." + attr + " AS " + attr;
            });
            returnString += ", " + alias + ".created_on AS created_on";
            returnString += ", " + alias + ".updated_on AS updated_on";
            returnString += ", " + alias + ".login_on AS login_on";
            return returnString;
        },
        user_login_return: function(alias, returnSchema) {
            // Always return the user ID
            var returnString = " id(" + alias + ") AS id";

            var attributes = db.schemaAttributes(returnSchema);
            if (!Array.isArray(attributes)) {
                return returnString;
            }

            // Never return password attribute (would be empty due to query)
            var pwIndex = attributes.indexOf("password");
            attributes.splice(pwIndex, 1);

            // Construct remaining return statement from requested properties
            attributes.forEach(function(attr, index) {
                returnString += ", " + alias + "." + attr + " AS " + attr;
            });
            returnString += ", " + alias + ".created_on AS created_on";
            returnString += ", " + alias + ".updated_on AS updated_on";
            returnString += ", " + alias + ".login_on AS login_on";
            returnString += ", " + alias + ".hash AS hash";
            return returnString;
        },
        user_create: function(user, label, alias, returnSchema) {
            var query = "CREATE (" + alias + ":" + label + " {user})";
            query += " RETURN " + this.user_return(alias, returnSchema);
            var params = {
                user: user
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        user_by_username_for_login: function(username, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE " + alias + ".username = \"" + username + "\"";
            query += " RETURN " + this.user_login_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_email_for_login: function(email, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE " + alias + ".email = \"" + email + "\"";
            query += " RETURN " + this.user_login_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_id: function(id, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE id(" + alias + ") = " + id;
            query += " RETURN " + this.user_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_google_id: function(id, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE " + alias + ".googleID = \"" + id + "\"";
            query += " RETURN " + this.user_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_facebook_id: function(id, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE " + alias + ".facebookID = \"" + id + "\"";
            query += " RETURN " + this.user_return(alias, returnSchema);
            console.log("QUERY = ", query);
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_filter: function(filter, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            var queryFilter = this.object_query_filter(filter, alias);
            // Expect valid filter
            if (queryFilter == null) {
                return this.errorFilter(label);
            }
            query += queryFilter;
            query += " RETURN " + this.user_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        user_all: function(label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " RETURN " + this.user_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        user_update: function(id, user, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE id(" + alias + ") = " + id;
            query += " SET " + alias + " += { user }";
            query += " RETURN " + this.user_return(alias, returnSchema);
            var params = {
                user: user
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        user_delete_by_id: function(id, label, alias) {
            var aliasRelationships = "relationship";
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE id(" + alias + ") = " + id;
            query += " OPTIONAL MATCH (" + alias + ")-[" + aliasRelationships + "]-()";
            query += " DELETE " + alias + ", " + aliasRelationships;
            query += " RETURN " + this.object_delete_return(alias);
            console.log("QUERY = ", query);
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        user_username_taken: function(username, label, alias) {
            var query = "MATCH (" + alias + ":" + label +")";
            query += " WHERE " + alias + ".username = \"" + username + "\"";
            query += " RETURN " + this.user_return(alias,[]);
            return this.cypher(query)
                .then(this.successTaken, this.error);
        },
        user_email_taken: function(email, label, alias) {
            var query = "MATCH (" + alias + ":" + label +")";
            query += " WHERE " + alias + ".email = \"" + email + "\"";
            query += " RETURN " + this.user_return(alias,[]);
            return this.cypher(query)
                .then(this.successTaken, this.error);
        },
        // ---------------------------------------------------------------------
        // RESTful Boilerplate
        // ---------------------------------------------------------------------
        object_query_filter: function(filter, alias) {
            // Expect valid filter
            if (filter == null || typeof filter !== 'object') {
                return null;
            }
            // Construct remaining query from filter conditions
            var queryFilter = " WHERE ";
            Object.keys(filter).forEach(function(attr, index) {
                // Format query condition based on type
                var condition = filter[attr];
                console.log("condition = ", condition);
                console.log(typeof condition);
                if (typeof condition === 'string') {
                    condition = "\"" + condition + "\"";
                }
                else if (Number.isFinite(condition)) {
                    condition = condition.toString() 
                }
                else {
                    return this.errorFilter(label);
                }
                // First condition doesn't require "AND" prefix
                if (index == 0) {
                    queryFilter += alias + "." + attr + " = " + condition
                }
                else {
                    queryFilter += " AND " + alias + "." + attr + " = " + condition
                }
            });
            return queryFilter;
        },
        object_return: function(alias, returnSchema) {
            // Always return the object ID
            var returnString = " id(" + alias + ") AS id";

            var attributes = db.schemaAttributes(returnSchema);
            if (!Array.isArray(attributes)) {
                return returnString;
            }
            // Construct remaining return statement from requested properties
            attributes.forEach(function(attr, index) {
                returnString += ", " + alias + "." + attr + " AS " + attr;
            });
            returnString += ", " + alias + ".created_on AS created_on";
            returnString += ", " + alias + ".updated_on AS updated_on";
            return returnString;
        },
        object_delete_return: function(alias) {
            // Delete returns total number of affected nodes and their ids
            var returnString = " COUNT(" + alias + ") AS affected";
            returnString += ", collect( id(" + alias + ") ) AS ids";
            return returnString;
        },
        object_create: function(object, label, alias, returnSchema) {
            var query = "CREATE (" + alias + ":" + label + " {object})";
            query += " RETURN " + this.object_return(alias, returnSchema);
            var params = {
                object: object
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        object_by_id: function(id, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE id(" + alias + ") = " + id;
            query += " RETURN " + this.object_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        object_by_filter: function(filter, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            var queryFilter = this.object_query_filter(filter, alias);
            // Expect valid filter
            if (queryFilter == null) {
                return this.errorFilter(label);
            }
            query += queryFilter;
            query += " RETURN " + this.object_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        object_all: function(label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " RETURN " + this.object_return(alias, returnSchema);
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        object_update: function(id, object, label, alias, returnSchema) {
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE id(" + alias + ") = " + id;
            query += " SET " + alias + " += { object }";
            query += " RETURN " + this.object_return(alias, returnSchema);
            var params = {
                object: object
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        object_delete_by_id: function(id, label, alias) {
            var aliasRelationships = "relationship";
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " WHERE id(" + alias + ") = " + id;
            query += " OPTIONAL MATCH (" + alias + ")-[" + aliasRelationships + "]-()";
            query += " DELETE " + alias + ", " + aliasRelationships;
            query += " RETURN " + this.object_delete_return(alias);
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        object_delete_by_filter: function(filter, label, alias) {
            var aliasRelationships = "relationship";
            var query = "MATCH (" + alias + ":" + label + ")";
            var queryFilter = this.object_query_filter(filter, alias);
            // Expect valid filter
            if (queryFilter == null) {
                return this.errorFilter(label);
            }
            query += queryFilter;
            query += " OPTIONAL MATCH (" + alias + ")-[" + aliasRelationships + "]-()";
            query += " DELETE " + alias + ", " + aliasRelationships;
            query += " RETURN " + this.object_delete_return(alias);
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        object_delete_all: function(label, alias) {
            var aliasRelationships = "relationship";
            var query = "MATCH (" + alias + ":" + label + ")";
            query += " OPTIONAL MATCH (" + alias + ")-[" + aliasRelationships + "]-()";
            query += " DELETE " + alias + ", " + aliasRelationships;
            query += " RETURN " + this.object_delete_return(alias);
            return this.cypher(query)
                .then(this.successDelete, this.error);
        }
    };

    return db;
}