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

module.exports = function FamilyDB() {
    var familyDB = {
        /* User Cypher Queries */
        family_return: function(alias) {
            return " id(" + alias + ") AS id, " +
                alias + ".name AS name, " +
                alias + ".created_on AS created_on, " +
                alias + ".updated_on AS updated_on";
        },
        family_delete_return: function(alias) {
            return " COUNT(f) AS affected, collect(id("+alias+")) AS ids";
        },
        family_create: function(family) {
            var query = "CREATE (f:Family {family}) " +
                " RETURN " + this.family_return("f");
            var params = {
                family: family
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        family_update: function(family, id) {
            var query = "MATCH (f:Family) WHERE id(f) = " + id + " SET f += { family } " +
                " RETURN " + this.family_return("f");
            var params = {
                family: family
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        family_by_id: function(id) {
            var query = "MATCH (f:Family) WHERE id(f) = " + id +
                " RETURN " + this.family_return("f");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        family_by_name: function(name) {
            var query = "MATCH (f:Family) WHERE f.name = \"" + name +
                "\" RETURN " + this.family_return("f");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        families_all: function() {
            var query = "MATCH (f:Family)" +
                " RETURN " + this.family_return("f");
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        family_delete_by_id: function(id) {
            var query = "MATCH (f:Family) WHERE id(f) = " + id + " OPTIONAL MATCH (f)-[r]-() DELETE f, r RETURN "+this.family_delete_return("f");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        family_delete_by_name: function(name) {
            var query = "MATCH (f:Family { name: \"" + name + "\" }) OPTIONAL MATCH (f)-[r]-() DELETE f, r RETURN "+this.family_delete_return("f");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        families_purge: function() {
            var query = "MATCH (f:Family) OPTIONAL MATCH (f)-[r]-() DELETE f, r RETURN "+this.family_delete_return("f");
            //TODO
        }
    };
    return familyDB;
}