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

module.exports = function ActivityDB() {
    var activityDB = {
        /* User Cypher Queries */
        activity_return: function(alias) {
            return " id(" + alias + ") AS id, " +
                alias + ".name AS name, " +
                alias + ".created_on AS created_on, " +
                alias + ".updated_on AS updated_on";
        },
        activity_delete_return: function(alias) {
            return " COUNT(a) AS affected, collect(id("+alias+")) AS ids";
        },
        activity_create: function(activity) {
            var query = "CREATE (a:Activity {activity}) " +
                " RETURN " + this.activity_return("a");
            var params = {
                activity: activity
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        activity_update: function(activity, id) {
            var query = "MATCH (a:Activity) WHERE id(a) = " + id + " SET a += { activity } " +
                " RETURN " + this.activity_return("a");
            var params = {
                activity: activity
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        activity_by_id: function(id) {
            var query = "MATCH (a:Activity) WHERE id(a) = " + id +
                " RETURN " + this.activity_return("a");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        activity_by_name: function(name) {
            var query = "MATCH (a:Activity) WHERE a.name = \"" + name +
                "\" RETURN " + this.activity_return("a");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        activities_all: function() {
            var query = "MATCH (a:Activity)" +
                " RETURN " + this.activity_return("a");
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        activity_delete_by_id: function(id) {
            var query = "MATCH (a:Activity) WHERE id(a) = " + id + " OPTIONAL MATCH (a)-[r]-() DELETE a, r RETURN "+this.activity_delete_return("a");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        activity_delete_by_name: function(name) {
            var query = "MATCH (a:Activity { name: \"" + name + "\" }) OPTIONAL MATCH (a)-[r]-() DELETE a, r RETURN "+this.activity_delete_return("a");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        activities_purge: function() {
            var query = "MATCH (a:Activity) OPTIONAL MATCH (a)-[r]-() DELETE a, r RETURN "+this.activity_delete_return("a");
            //TODO
        }
    };
    return activityDB;
}