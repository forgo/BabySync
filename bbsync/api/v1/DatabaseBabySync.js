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

module.exports = function DatabaseBabySync(db) {
    var dbBabySync = {
        /*
         * Cypher query which can be used standalone or appended to other query
         * operations. The return of this statement is a standard family data
         * object to be consumed by external client appliations in a consistent
         * and comprehensive manner.
         * @param {string} aliasLookup - Alias used in return MATCH statement to 
         * filter family lookup condition. 
         * @param {string} attributeLookup - Attribute used in return MATCH 
         * statement to filter family lookup condition.
         * @param {string} valueLookup - Value to filter out unique family.
         * @return {string} A string which represents a valid Neo4j Cypher
         * query that returns the standard family data object.
         *
         * In general, because this lookup 
         * should be limited to unique properties that return a single family, 
         * there are recommended use cases:
         *
         * family_return("p", "email", "lookup"), where the unique email of a
         * parent (responsible for the family we wish to return) is aliased in
         * a prior "WITH" statement. 
         *
         * For example: "WITH p.email AS lookup" 
         * would be the last cypher statement before appending this query.
         *
         * OR
         *
         * family_return("f", "id", "fnew"), where the id of the family we wish
         * to return is aliased in a prior "WITH" statement. 
         * 
         * For example: 
         * "WITH f AS fnew" would be the last cypher statement before appending
         * this query.
         */
        family_return_by_email: function(email) {
            return this.family_return("u.email = '" + email + "'");
        },
        family_return_by_id: function(id) {
            return this.family_return("id(f) = " + id);
        },
        family_return: function(uniqueCondition) {
            var familyReturnQuery = " MATCH"+
            " (u:User)<-[pAV:AUTHENTICATES_VIA]-(p:Parent)-[pRF:RESPONSIBLE_FOR]->(f:Family)"+
            " WHERE " + uniqueCondition + " AND NOT pRF.pendingApproval"+
            " WITH f"+
            " MATCH (p:Parent)-[:RESPONSIBLE_FOR]->(f)"+
            " WITH f, { id: id(f), name: f.name, created_on: f.created_on, updated_on: f.updated_on } AS family,"+
            " COLLECT( DISTINCT {"+
            " id: id(p),"+
            " facebookID: p.facebookID,"+
            " name: p.name,"+
            " email: p.email,"+ 
            " created_on: p.created_on,"+
            " updated_on: p.updated_on"+
            " } ) AS parents"+
            " OPTIONAL MATCH"+
            " (a:Activity)-[:MANAGED_BY]->(f)"+
            " WITH f, family, parents,"+
            " COLLECT( DISTINCT {"+
            " id: id(a),"+
            " name: a.name,"+ 
            " icon: a.icon,"+
            " warn: a.warn,"+
            " critical: a.critical,"+ 
            " created_on: a.created_on,"+ 
            " updated_on: a.updated_on"+ 
            " } ) AS activities"+
            " OPTIONAL MATCH"+
            " (a:Activity)<-[:ADHERES_TO]-(t:Timer)<-[:TRACKED_BY]-(b:Baby)-[:RESPONSIBILITY_OF]->(f)"+ 
            " WITH family, parents, activities,"+
            " {"+ 
            "       id: id(b),"+ 
            "       name: b.name,"+ 
            "       created_on: b.created_on,"+ 
            "       updated_on: b.updated_on,"+
            "       timers: COLLECT( DISTINCT( {"+
            "             id: id(t),"+ 
            "             activityID: id(a),"+ 
            "             resetDate: t.resetDate,"+ 
            "             enabled: t.enabled,"+
            "             push: t.push,"+ 
            "             created_on: a.created_on,"+ 
            "             updated_on: a.updated_on"+   
            "       } ) )"+
            " } AS babies"+
            " WITH family, parents, activities, COLLECT( DISTINCT( babies ) ) AS babies"+
            " RETURN family, parents, activities, babies";
            return familyReturnQuery;
        },
        family_create_query_object: function(userEmail, parentAlias, isUnique) {

            // Add date fields
            var now = new Date();
            var createDate = now;
            var updateDate = now;

            var parent = null;
            var parentBind = parentAlias;
            var userCondition = " ";
            var unique = isUnique ? " UNIQUE " : "";
            if (userEmail != null) {
                userCondition = " WHERE u.email = '" + userEmail + "'";
                parentBind = parentAlias + ":Parent {parm_parent}";
                // TODO: parent just borrow email from user as name for now
                parent = {
                    name: userEmail
                };
                parent.created_on = createDate;
                parent.updated_on = updateDate;
            }

            var responsible = {
                pendingApproval: false
            };

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
                parm_responsible: responsible,
                parm_family: family,
                parm_activity1: activity1,
                parm_activity2: activity2,
                parm_activity3: activity3,
                parm_baby: baby,
                parm_timer1: timer1,
                parm_timer2: timer2,
                parm_timer3: timer3
            };

            if (parent != null) {
                params["parm_parent"] = parent;
            }

            var create = " CREATE " + unique + " (u:User)<-[pAV:AUTHENTICATES_VIA]-(" + parentBind + ")-[pRF:RESPONSIBLE_FOR {parm_responsible}]->(f:Family {parm_family}),"+
                " (a1:Activity {parm_activity1})-[:MANAGED_BY]->(f),"+
                " (a2:Activity {parm_activity2})-[:MANAGED_BY]->(f),"+
                " (a3:Activity {parm_activity3})-[:MANAGED_BY]->(f),"+
                " (b:Baby {parm_baby})-[:RESPONSIBILITY_OF]->(f),"+
                " (b)-[:TRACKED_BY]->(t1:Timer {parm_timer1})-[:ADHERES_TO]->(a1),"+
                " (b)-[:TRACKED_BY]->(t2:Timer {parm_timer2})-[:ADHERES_TO]->(a2),"+
                " (b)-[:TRACKED_BY]->(t3:Timer {parm_timer3})-[:ADHERES_TO]->(a3)"+
                userCondition+
                " WITH " + parentAlias + " AS pcreate, f AS fcreate";

            return {query:create,params:params};
        },

        family_find: function(parentEmail) {
           var query = this.family_return_by_email(parentEmail);
           return db.cypher(query)
            .then(db.successOneOrNone, db.error);
        },

        family_join_new: function(familyID, parentEmail) {
            var responsible = {
                pendingApproval: true
            };

            var params = {
                parm_responsible: responsible
            };

            var joinNew = " CREATE UNIQUE (p:Parent)-[pRF:RESPONSIBLE_FOR {parm_responsible}]->(f:Family)";
        },

        // (b)-[:TRACKED_BY]->(t1:Timer {parm_timer1})-[:ADHERES_TO]->(a1:Activity {parm_activity1})-[:MANAGED_BY]->(f)

        /*
         * Cypher query to create a new stubbed-out family with a requested
         * parent object, as an asynchronous Q promise. The nodes which make up 
         * the family borrow the created_on and updated_on properties of the 
         * provided parent. These dates should be appended to the requested
         * parent object after Parent schema validation and before calling this 
         * method.
         * @param {Object} parent - requested parent object to create new family
         * for
         * @return {external:Q.Promise} on success, the promise resolves to an 
         * auxiliary promise defined by {@link module:Database.successOneOrNone}
         */
         //TODO: parent param should be replaced with user, then refactor on that...
        family_create: function(userEmail) {
            var create = this.family_create_query_object(userEmail,"p",false);
            var query = create.query;
            query += this.family_return_by_email(parent.email);
            return db.cypher({
                query: query,
                params: create.params
            })
            .then(db.successOneOrNone, db.error);
        },
        /*
         * Cypher query to join parent with family, as an asynchronous Q 
         * promise. If the family the parent is leaving contains no other 
         * parents, all the old family-related nodes and relationships are 
         * deleted. If the family the parent is leaving contains any parents, 
         * all the old family-related nodes and relationships are maintained 
         * except for the relationship :RESPONSIBLE_FOR between the Parent node 
         * and old Family node. In all cases, a new :RESPONSIBLE_FOR 
         * relationship is created between the parent and the new Family
         * @param {string} familyID - id of Family node to join with.
         * @param {string} parentEmail - unique email property of joining Parent 
         * node
         * @return {external:Q.Promise} on success, the promise resolves to an 
         * auxiliary promise defined by {@link module:Database.successOneOrNone}
         */
        family_join: function(familyToJoinWithID, joiningParentEmail) {
            var query = "MATCH"+
            " (p:Parent)-[pRF:RESPONSIBLE_FOR]->(f:Family),"+
            " (fnew:Family)"+
            " WHERE p.email = '" + joiningParentEmail + "' AND id(fnew) = " + familyToJoinWithID + " AND id(f) <> " + familyToJoinWithID +
            " WITH p, pRF, f, fnew"+
            " OPTIONAL MATCH"+
            " (pO:Parent)-[pORF:RESPONSIBLE_FOR]->(f)"+
            " WHERE pO.email <> '" + joiningParentEmail + "'"+
            " WITH p, pRF, f, fnew, COUNT(pO) AS nOtherParents"+
            " OPTIONAL MATCH"+
            " (t:Timer)-[tAT:ADHERES_TO]->(a:Activity)-[aMB:MANAGED_BY]->(f)<-[bRO:RESPONSIBILITY_OF]-(b:Baby)-[bTB:TRACKED_BY]->(t)"+
            " WITH p, pRF, f, fnew, nOtherParents,"+
            " COLLECT(DISTINCT(pRF)) AS multiParentRelsDel,"+
            " COLLECT(DISTINCT(tAT))+"+
            " COLLECT(DISTINCT(aMB))+"+
            " COLLECT(DISTINCT(bRO))+"+
            " COLLECT(DISTINCT(bTB))+"+
            " COLLECT(DISTINCT(pRF)) AS onlyParentRelsDel,"+
            " COLLECT(DISTINCT(t))+"+
            " COLLECT(DISTINCT(a))+"+
            " COLLECT(DISTINCT(b))+"+
            " COLLECT(DISTINCT(f)) AS onlyParentNodsDel"+
            " WITH p, fnew, nOtherParents, onlyParentRelsDel, onlyParentNodsDel, multiParentRelsDel,"+
            " CASE nOtherParents"+
            " WHEN 0"+
            " THEN {rels:onlyParentRelsDel, nods:onlyParentNodsDel}"+
            " ELSE {rels:multiParentRelsDel, nods:[]}"+
            " END AS deletable"+
            " FOREACH(r in deletable.rels | DELETE r)"+
            " FOREACH(n in deletable.nods | DELETE n)"+
            " CREATE UNIQUE (p)-[:RESPONSIBLE_FOR]->(fnew)"+
            " WITH DISTINCT(p) AS pjoin, fnew AS fjoin";
            query += this.family_return_by_id(familyToJoinWithID);
            return db.cypher(query)
            .then(db.successOneOrNone, db.error);
        },
        // Merges existing activities/timers/babies with another family
        // if multiple parents, preserves for old family -- otherwise delete old family stuff
        family_merge: function(familyToMergeWithID, mergingParentEmail) {

            var responsible = {
                pendingApproval: true
            };

            var params = {
                parm_responsible: responsible
            };

            var query = " MATCH"+
            " (p:Parent)-[pRF:RESPONSIBLE_FOR]->(f:Family),"+
            " (fnew:Family)"+
            " WHERE p.email = '" + mergingParentEmail + "' AND id(fnew) = " + familyToMergeWithID + " AND id(f) <> " + familyToMergeWithID +
            " WITH p, pRF, f, fnew"+
            " OPTIONAL MATCH"+
            " (pO:Parent)-[pORF:RESPONSIBLE_FOR]->(f)"+
            " WHERE pO.email <> '" + mergingParentEmail + "'"+
            " WITH p, pRF, f, fnew, COUNT(pO) AS nOtherParents"+
            // Copy parent's activities into new family, 
            // parent name appended to activity name property to distinguish those merged
            " OPTIONAL MATCH"+
            " (a:Activity)-[:MANAGED_BY]->(f)"+
            " WITH p, pRF, f, fnew, nOtherParents, COLLECT(DISTINCT(a)) AS activities"+
            " UNWIND activities AS activity"+
            " CREATE (acopy:Activity)-[:MANAGED_BY]->(fnew)"+
            " SET acopy = activity, acopy.name = activity.name + \" (\" + p.name + \")\","+
            " acopy += { copiedFromID: id(activity) }"+
            " WITH p, pRF, f, fnew, nOtherParents"+
            // Copy parent's babies into new family,
            // parent name appended to baby name property to distinguish those merged
            " OPTIONAL MATCH"+
            " (b:Baby)-[:RESPONSIBILITY_OF]->(f)"+
            " WITH p, pRF, f, fnew, nOtherParents, COLLECT(DISTINCT(b)) AS babies"+
            " UNWIND babies AS baby"+
            " CREATE (bcopy:Baby)-[:RESPONSIBILITY_OF]->(fnew)"+
            " SET bcopy = baby, bcopy.name = baby.name + \" (\" + p.name + \")\""+
            " WITH p, pRF, f, fnew, nOtherParents, baby, bcopy"+
            // Copy parent's babies' timers into new family,
            // parent name appended to baby name property to distinguish those merged
            " OPTIONAL MATCH"+
            " (baby)-[:TRACKED_BY]->(t:Timer)"+
            " WITH p, pRF, f, fnew, nOtherParents, bcopy, COLLECT(DISTINCT(t)) AS timers"+
            " UNWIND timers AS timer"+
            " CREATE (tcopy:Timer)<-[:TRACKED_BY]-(bcopy)"+
            " SET tcopy = timer"+
            " WITH p, pRF, f, fnew, nOtherParents, timer, tcopy"+
            // Copy parent's babies' timers relationship with activities
            // relationship preserved w/temp property in previously copied activities
            " OPTIONAL MATCH"+
            " (timer)-[:ADHERES_TO]->(a:Activity),"+
            " (acopy:Activity)-[:MANAGED_BY]->(fnew)"+
            " WHERE acopy.copiedFromID = id(a)"+
            " WITH p, pRF, f, fnew, nOtherParents, tcopy, acopy, COLLECT(DISTINCT(a)) AS activities"+
            " UNWIND activities AS activity"+
            " CREATE (tcopy)-[:ADHERES_TO]->(acopy)"+
            " REMOVE acopy.copiedFromID"+
            " WITH p, pRF, f, fnew, nOtherParents"+
            // Now Move Parent and Delete Leftovers Depending on if Single Parent Family
            " OPTIONAL MATCH"+
            " (t:Timer)-[tAT:ADHERES_TO]->(a:Activity)-[aMB:MANAGED_BY]->(f)<-[bRO:RESPONSIBILITY_OF]-(b:Baby)-[bTB:TRACKED_BY]->(t)"+
            " WITH p, pRF, f, fnew, nOtherParents,"+
            " COLLECT(DISTINCT(pRF)) AS multiParentRelsDel,"+
            " COLLECT(DISTINCT(tAT))+"+
            " COLLECT(DISTINCT(aMB))+"+
            " COLLECT(DISTINCT(bRO))+"+
            " COLLECT(DISTINCT(bTB))+"+
            " COLLECT(DISTINCT(pRF)) AS onlyParentRelsDel,"+
            " COLLECT(DISTINCT(t))+"+
            " COLLECT(DISTINCT(a))+"+
            " COLLECT(DISTINCT(b))+"+
            " COLLECT(DISTINCT(f)) AS onlyParentNodsDel"+
            " WITH p, fnew, nOtherParents, onlyParentRelsDel, onlyParentNodsDel, multiParentRelsDel,"+
            " CASE nOtherParents"+
            " WHEN 0"+
            " THEN {rels:onlyParentRelsDel, nods:onlyParentNodsDel}"+
            " ELSE {rels:multiParentRelsDel, nods:[]}"+
            " END AS deletable"+
            " FOREACH(r in deletable.rels | DELETE r)"+
            " FOREACH(n in deletable.nods | DELETE n)"+
            " CREATE UNIQUE (p)-[pRF:RESPONSIBLE_FOR {parm_responsible}]->(fnew)"+
            " WITH DISTINCT(p) AS pmerge, fnew AS fmerge";
            query += this.family_return_by_id(familyToMergeWithID);

            return db.cypher({
                query: query,
                params: params
            })
            .then(db.successOneOrNone, db.error);
        },
        /*
         * Cypher query to detach parent from family, as an asynchronous Q 
         * promise. If the parent attempts to detach from a family of which they
         * are the only parent, this is effectively the same as family_create --
         * with the prior deletion of all the old family-related nodes and
         * relationships. If the parent attempts to detach from a family of 
         * which they are NOT the only parent, this is effectively the same as
         * family_create -- with the prior deletion of the :RESPONSIBLE_FOR 
         * relationship between the Parent node and old Family node.
         * 
         * @param {Object} parent - requested parent object to detach from
         * family
         * @return {external:Q.Promise} on success, the promise resolves to an 
         * auxiliary promise defined by {@link module:Database.successOneOrNone}
         */
        family_detach: function(parentToDetachEmail) {
            var query = "MATCH"+
            " (u:User)<-[pAV:AUTHENTICATES_VIA]-(p:Parent)-[pRF:RESPONSIBLE_FOR]->(f:Family)"+
            " WHERE u.email = '" + parentToDetachEmail + "'"+
            " WITH p, pRF, f"+
            " OPTIONAL MATCH"+
            " (pO:Parent)-[pORF:RESPONSIBLE_FOR]->(f)"+
            " WHERE pO.email <> '" + parentToDetachEmail + "'"+
            " WITH p, pRF, f, COUNT(pO) AS nOtherParents"+
            " OPTIONAL MATCH"+
            " (t:Timer)-[tAT:ADHERES_TO]->(a:Activity)-[aMB:MANAGED_BY]->(f)<-[bRO:RESPONSIBILITY_OF]-(b:Baby)-[bTB:TRACKED_BY]->(t)"+
            " WITH p, pRF, f, nOtherParents,"+
            " COLLECT(DISTINCT(pRF)) AS multiParentRelsDel,"+
            " COLLECT(DISTINCT(tAT))+"+
            " COLLECT(DISTINCT(aMB))+"+
            " COLLECT(DISTINCT(bRO))+"+
            " COLLECT(DISTINCT(bTB))+"+
            " COLLECT(DISTINCT(pRF)) AS onlyParentRelsDel,"+
            " COLLECT(DISTINCT(t))+"+
            " COLLECT(DISTINCT(a))+"+
            " COLLECT(DISTINCT(b))+"+
            " COLLECT(DISTINCT(f)) AS onlyParentNodsDel"+
            " WITH p, nOtherParents, onlyParentRelsDel, onlyParentNodsDel, multiParentRelsDel,"+
            " CASE nOtherParents"+
            " WHEN 0"+
            " THEN {rels:onlyParentRelsDel, nods:onlyParentNodsDel}"+
            " ELSE {rels:multiParentRelsDel, nods:[]}"+
            " END AS deletable"+
            " FOREACH(r in deletable.rels | DELETE r)"+
            " FOREACH(n in deletable.nods | DELETE n)"+
            " WITH p AS pdetach";
            var create = this.family_create_query_object(null, "pdetach", true);
            query += create.query;
            query += this.family_return_by_email(parentToDetachEmail);
            return db.cypher({
                query: query,
                params: create.params
            })
            .then(db.successOneOrNone, db.error);
        }
    };

    return dbBabySync;
}