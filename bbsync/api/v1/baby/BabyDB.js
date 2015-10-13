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

module.exports = function BabyDB() {
    var babyDB = {
        /* User Cypher Queries */
        baby_return: function(alias) {
            return " id(" + alias + ") AS id, " +
                alias + ".name AS name, " +
                alias + ".created_on AS created_on, " +
                alias + ".updated_on AS updated_on";
        },
        baby_delete_return: function(alias) {
            return " COUNT(b) AS affected, collect(id("+alias+")) AS ids";
        },
        baby_create: function(baby) {
            var query = "CREATE (b:Baby {baby}) " +
                " RETURN " + this.baby_return("b");
            var params = {
                baby: baby
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        baby_update: function(baby, id) {
            var query = "MATCH (b:Baby) WHERE id(b) = " + id + " SET b += { baby } " +
                " RETURN " + this.baby_return("b");
            var params = {
                baby: baby
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        baby_by_id: function(id) {
            var query = "MATCH (b:Baby) WHERE id(b) = " + id +
                " RETURN " + this.baby_return("b");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        baby_by_name: function(name) {
            var query = "MATCH (b:Baby) WHERE b.name = \"" + name +
                "\" RETURN " + this.baby_return("b");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        babies_all: function() {
            var query = "MATCH (b:Baby)" +
                " RETURN " + this.baby_return("b");
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        baby_delete_by_id: function(id) {
            var query = "MATCH (b:Baby) WHERE id(b) = " + id + " OPTIONAL MATCH (b)-[r]-() DELETE b, r RETURN "+this.baby_delete_return("b");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        baby_delete_by_name: function(name) {
            var query = "MATCH (b:Baby { name: \"" + name + "\" }) OPTIONAL MATCH (b)-[r]-() DELETE b, r RETURN "+this.baby_delete_return("b");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        babies_purge: function() {
            var query = "MATCH (b:Baby) OPTIONAL MATCH (b)-[r]-() DELETE b, r RETURN "+this.baby_delete_return("b");
            //TODO
        }
    };
    return babyDB;
}