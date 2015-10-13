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

module.exports = function ParentDB() {
	var parentDB = {
		/* User Cypher Queries */
		parent_return: function(alias) {
			return " id(" + alias + ") AS id, " +
				alias + ".name AS name, " +
                alias + ".email AS email, " +
                alias + ".facebookID AS facebookID, " +
				alias + ".created_on AS created_on, " +
				alias + ".updated_on AS updated_on";
		},
		parent_delete_return: function(alias) {
			return " COUNT(p) AS affected, collect(id(" + alias + ")) AS ids";
		},
		parent_create: function(parent) {
			var createDate = parent.created_on;
			var updateDate = parent.updated_on;

            console.log("1");

			var family = {
				name: "My Family"
			};
			family.created_on = createDate;
			family.updated_on = updateDate;

			var activity1 = {
				name: "Diaper",
				icon: "Diaper",
				warn: 7200.0,
				critical: 10800.0
			};
			activity1.created_on = createDate;
			activity1.updated_on = updateDate;

			var activity2 = {
				name: "Food",
				icon: "Food",
				warn: 7200.0,
				critical: 10800.0
			};
			activity2.created_on = createDate;
			activity2.updated_on = updateDate;

			var activity3 = {
				name: "Sleep",
				icon: "Sleep",
				warn: 7200.0,
				critical: 10800.0
			};
			activity3.created_on = createDate;
			activity3.updated_on = updateDate;

			var baby = {
				name: "Baby 1"
			};
			baby.created_on = createDate;
			baby.updated_on = updateDate;

			var timer1 = {
				resetDate: createDate,
				enabled: true,
				push: false
			};
			timer1.created_on = createDate;
			timer1.updated_on = updateDate;

			var timer2 = {
				resetDate: createDate,
				enabled: true,
				push: false
			};
			timer2.created_on = createDate;
			timer2.updated_on = updateDate;

			var timer3 = {
				resetDate: createDate,
				enabled: true,
				push: false
			};
			timer3.created_on = createDate;
			timer3.updated_on = updateDate;

            var params = {
                parm_parent: parent,
                parm_family: family,
                parm_activity1: activity1,
                parm_activity2: activity2,
                parm_activity3: activity3,
                parm_baby: baby,
                parm_timer1: timer1,
                parm_timer2: timer2,
                parm_timer3: timer3
            };

            ///
            var query = "CREATE (p:Parent {parm_parent})-[:RESPONSIBLE_FOR]->(f:Family {parm_family}), "+
                "(a1:Activity {parm_activity1})-[:MANAGED_BY]->(f), "+
                "(a2:Activity {parm_activity2})-[:MANAGED_BY]->(f), "+
                "(a3:Activity {parm_activity3})-[:MANAGED_BY]->(f), "+
                "(b:Baby {parm_baby})-[:RESPONSIBILITY_OF]->(f), "+
                "(b)-[:TRACKED_BY]->(t1:Timer {parm_timer1})-[:ADHERES_TO]->(a1), "+
                "(b)-[:TRACKED_BY]->(t2:Timer {parm_timer2})-[:ADHERES_TO]->(a2), "+
                "(b)-[:TRACKED_BY]->(t3:Timer {parm_timer3})-[:ADHERES_TO]->(a3) "+
                "WITH p.facebookID AS lookup "+
                "MATCH (p:Parent)-[:RESPONSIBLE_FOR]->"+
                "(f:Family)<-[:MANAGED_BY]-"+
                "(a:Activity)<-[:ADHERES_TO]-"+
                "(t:Timer)<-[:TRACKED_BY]-"+
                "(b:Baby)-[:RESPONSIBILITY_OF]->(f) "+
                "WHERE p.facebookID = lookup "+
                "WITH { id: id(f), name: f.name, created_on: f.created_on, updated_on: f.updated_on } AS family,"+
                "COLLECT( DISTINCT { "+
                "id: id(p), "+
                "facebookID: p.facebookID, "+
                "name: p.name, "+
                "email: p.email, "+
                "created_on: p.created_on, "+
                "updated_on: p.updated_on "+
                "} ) AS parents, "+
                "COLLECT( DISTINCT { "+
                "id: id(a), "+
                "name: a.name, "+
                "icon: a.icon, "+
                "warn: a.warn, "+
                "critical: a.critical, "+
                "created_on: a.created_on, "+
                "updated_on: a.updated_on "+
                "} ) AS activities, "+
                "b, "+
                "COLLECT( DISTINCT { "+
                "id: id(t), "+
                "activityID: id(a), "+
                "resetDate: t.resetDate, "+
                "enabled: t.enabled, "+
                "push: t.push, "+
                "created_on: a.created_on, "+
                "updated_on: a.updated_on "+
                "} ) AS timers "+
                "RETURN family, parents, activities, COLLECT( DISTINCT { id: id(b), name: b.name, created_on: b.created_on, updated_on: b.updated_on, timers: timers }) AS babies";

			return this.cypher({
					query: query,
					params: params
				})
				.then(this.successOneOrNone, this.error);
		},
		parent_update: function(parent, id) {
			var query = "MATCH (p:Parent) WHERE id(p) = " + id + " SET p += { parent } " +
				" RETURN " + this.parent_return("p");
			var params = {
				parent: parent
			};
			return this.cypher({
					query: query,
					params: params
				})
				.then(this.successOneOrNone, this.error);
		},
		parent_by_id: function(id) {
			var query = "MATCH (p:Parent) WHERE id(p) = " + id +
				" RETURN " + this.parent_return("p");
			return this.cypher(query)
				.then(this.successOneOrNone, this.error);
		},
		parent_by_facebook_id: function(facebook_id) {

            var query = "MATCH (p:Parent)-[:RESPONSIBLE_FOR]->"+
                "(f:Family)<-[:MANAGED_BY]-"+
                "(a:Activity)<-[:ADHERES_TO]-"+
                "(t:Timer)<-[:TRACKED_BY]-"+
                "(b:Baby)-[:RESPONSIBILITY_OF]->(f) "+
                "WHERE p.facebookID = \""+facebook_id+"\" "+
                "WITH { id: id(f), name: f.name, created_on: f.created_on, updated_on: f.updated_on } AS family,"+
                "COLLECT( DISTINCT { "+
                "id: id(p), "+
                "facebookID: p.facebookID, "+
                "name: p.name, "+
                "email: p.email, "+
                "created_on: p.created_on, "+
                "updated_on: p.updated_on "+
                "} ) AS parents, "+
                "COLLECT( DISTINCT { "+
                "id: id(a), "+
                "name: a.name, "+
                "icon: a.icon, "+
                "warn: a.warn, "+
                "critical: a.critical, "+
                "created_on: a.created_on, "+
                "updated_on: a.updated_on "+
                "} ) AS activities, "+
                "b, "+
                "COLLECT( DISTINCT { "+
                "id: id(t), "+
                "activityID: id(a), "+
                "resetDate: t.resetDate, "+
                "enabled: t.enabled, "+
                "push: t.push, "+
                "created_on: a.created_on, "+
                "updated_on: a.updated_on "+
                "} ) AS timers "+
                "RETURN family, parents, activities, COLLECT( DISTINCT { id: id(b), name: b.name, created_on: b.created_on, updated_on: b.updated_on, timers: timers }) AS babies";




			// var query = "MATCH (p:Parent) WHERE p.facebookID = \"" + facebook_id +
			// 	"\" RETURN " + this.parent_return("p");
			return this.cypher(query)
				.then(this.successOneOrNone, this.error);
		},
		parent_by_name: function(name) {
			var query = "MATCH (p:Parent) WHERE p.name = \"" + name +
				"\" RETURN " + this.parent_return("p");
			return this.cypher(query)
				.then(this.successOneOrNone, this.error);
		},
		parents_all: function() {
			var query = "MATCH (p:Parent)" +
				" RETURN " + this.parent_return("p");
			return this.cypher(query)
				.then(this.successAll, this.error);
		},
		parent_delete_by_id: function(id) {
			var query = "MATCH (p:Parent) WHERE id(p) = " + id + " OPTIONAL MATCH (p)-[r]-() DELETE p, r RETURN " + this.parent_delete_return("p");
			return this.cypher(query)
				.then(this.successDelete, this.error);
		},
		parent_delete_by_name: function(name) {
			var query = "MATCH (p:Parent { name: \"" + name + "\" }) OPTIONAL MATCH (p)-[r]-() DELETE p, r RETURN " + this.parent_delete_return("p");
			return this.cypher(query)
				.then(this.successDelete, this.error);
		},
		parents_purge: function() {
			var query = "MATCH (p:Parent) OPTIONAL MATCH (p)-[r]-() DELETE p, r RETURN " + this.parent_delete_return("p");
			//TODO
		}
	};
	return parentDB;
}