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

module.exports = function TimerDB() {
    var timerDB = {
        /* User Cypher Queries */
        timer_return: function(alias) {
            return " id(" + alias + ") AS id, " +
                alias + ".name AS name, " +
                alias + ".created_on AS created_on, " +
                alias + ".updated_on AS updated_on";
        },
        timer_delete_return: function(alias) {
            return " COUNT(t) AS affected, collect(id("+alias+")) AS ids";
        },
        timer_create: function(timer) {
            var query = "CREATE (t:Timer {timer}) " +
                " RETURN " + this.timer_return("t");
            var params = {
                timer: timer
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        timer_update: function(timer, id) {
            var query = "MATCH (t:Timer) WHERE id(t) = " + id + " SET t += { timer } " +
                " RETURN " + this.timer_return("t");
            var params = {
                timer: timer
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        timer_by_id: function(id) {
            var query = "MATCH (t:Timer) WHERE id(t) = " + id +
                " RETURN " + this.timer_return("t");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        timer_by_name: function(name) {
            var query = "MATCH (t:Timer) WHERE t.name = \"" + name +
                "\" RETURN " + this.timer_return("t");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        timers_all: function() {
            var query = "MATCH (t:Timer)" +
                " RETURN " + this.timer_return("t");
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        timer_delete_by_id: function(id) {
            var query = "MATCH (t:Timer) WHERE id(t) = " + id + " OPTIONAL MATCH (t)-[r]-() DELETE t, r RETURN "+this.timer_delete_return("t");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        timer_delete_by_name: function(name) {
            var query = "MATCH (t:Timer { name: \"" + name + "\" }) OPTIONAL MATCH (t)-[r]-() DELETE t, r RETURN "+this.timer_delete_return("t");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        timers_purge: function() {
            var query = "MATCH (t:Timer) OPTIONAL MATCH (t)-[r]-() DELETE t, r RETURN "+this.timer_delete_return("t");
            //TODO
        }
    };
    return timerDB;
}