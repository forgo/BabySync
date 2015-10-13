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

module.exports = function UserDB() {
    var userDB = {
        /* User Cypher Queries */
        user_return: function(alias) {
            return " id(" + alias + ") AS id, " +
                alias + ".username AS username, " +
                alias + ".firstname AS firstname, " +
                alias + ".lastname AS lastname, " +
                alias + ".email AS email, " +
                alias + ".birthday AS birthday, " +
                alias + ".phone AS phone, " +
                alias + ".created_on AS created_on, " +
                alias + ".updated_on AS updated_on, " +
                alias + ".login_on AS login_on";
        },
        user_login_return: function(alias) {
            return " id(" + alias + ") AS id, " +
                alias + ".username AS username, " +
                alias + ".firstname AS firstname, " +
                alias + ".lastname AS lastname, " +
                alias + ".email AS email, " +
                alias + ".birthday AS birthday, " +
                alias + ".phone AS phone, " +
                alias + ".created_on AS created_on, " +
                alias + ".updated_on AS updated_on, " +
                alias + ".login_on AS login_on, " +
                alias + ".hash AS hash";
        },
        user_delete_return: function(alias) {
            return " COUNT(u) AS affected, collect(id("+alias+")) AS ids";
        },
        user_create: function(user) {
            var query = "CREATE (u:User {user}) " +
                " RETURN " + this.user_return("u");
            var params = {
                user: user
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        user_update: function(user, id) {
            var query = "MATCH (u:User) WHERE id(u) = " + id + " SET u += { user } " +
                " RETURN " + this.user_return("u");
            var params = {
                user: user
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        user_by_id: function(id) {
            var query = "MATCH (u:User) WHERE id(u) = " + id +
                " RETURN " + this.user_return("u");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_username: function(username) {
            var query = "MATCH (u:User) WHERE u.username = \"" + username +
                "\" RETURN " + this.user_return("u");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_username_for_login: function(username) {
            var query = "MATCH (u:User) WHERE u.username = \"" + username +
                "\" RETURN " + this.user_login_return("u");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_email: function(email) {
            var query = "MATCH (u:User) WHERE u.email = \"" + email +
                "\" RETURN " + this.user_return("u");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        user_by_email_for_login: function(email) {
            var query = "MATCH (u:User) WHERE u.email = \"" + email +
                "\" RETURN " + this.user_login_return("u");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        users_all: function() {
            var query = "MATCH (u:User)" +
                " RETURN " + this.user_return("u");
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        user_delete_by_id: function(id) {
            var query = "MATCH (u:User) WHERE id(u) = " + id + " OPTIONAL MATCH (u)-[r]-() DELETE u, r RETURN "+this.user_delete_return("u");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        user_delete_by_username: function(username) {
            var query = "MATCH (u:User { username: \"" + username + "\" }) OPTIONAL MATCH (u)-[r]-() DELETE u, r RETURN "+this.user_delete_return("u");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        user_delete_by_email: function(email) {
            var query = "MATCH (u:User { email: \"" + email + "\" }) OPTIONAL MATCH (u)-[r]-() DELETE u, r RETURN "+this.user_delete_return("u");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        users_purge: function() {
            var query = "MATCH (u:User) OPTIONAL MATCH (u)-[r]-() DELETE u, r RETURN "+this.user_delete_return("u");
            //TODO
        },
        user_username_taken: function(username) {
            var query = "MATCH (u:User) WHERE u.username = \"" + username +
                "\" RETURN " + this.user_return("u");
            return this.cypher(query)
                .then(this.successTaken, this.error);
        },
        user_email_taken: function(email) {
            var query = "MATCH (u:User) WHERE u.email = \"" + email +
                "\" RETURN " + this.user_return("u");
            return this.cypher(query)
                .then(this.successTaken, this.error);
        }
    };
    return userDB;
}