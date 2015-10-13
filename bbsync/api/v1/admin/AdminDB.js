module.exports = function AdminDB() {
    var adminDB = {
        /* Admin Cypher Queries */
        admin_return: function(alias) {
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
        admin_login_return: function(alias) {
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
        admin_delete_return: function(alias) {
            return " COUNT(a) AS affected, collect(id("+alias+")) AS ids";
        },
        admin_create: function(admin) {
            var query = "CREATE (a:Admin {admin}) " +
                " RETURN " + this.admin_return("a");
            var params = {
                admin: admin
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        admin_update: function(admin, id) {
            var query = "MATCH (a:Admin) WHERE id(a) = " + id + " SET a += { admin } " +
                " RETURN " + this.admin_return("a");
            var params = {
                admin: admin
            };
            return this.cypher({
                    query: query,
                    params: params
                })
                .then(this.successOneOrNone, this.error);
        },
        admin_by_id: function(id) {
            var query = "MATCH (a:Admin) WHERE id(a) = " + id +
                " RETURN " + this.admin_return("a");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        admin_by_username: function(username) {
            var query = "MATCH (a:Admin) WHERE a.username = \"" + username +
                "\" RETURN " + this.admin_return("a");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        admin_by_username_for_login: function(username) {
            var query = "MATCH (a:Admin) WHERE a.username = \"" + username +
                "\" RETURN " + this.admin_login_return("a");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        admin_by_email: function(email) {
            var query = "MATCH (a:Admin) WHERE a.email = \"" + email +
                "\" RETURN " + this.admin_return("a");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        admin_by_email_for_login: function(email) {
            var query = "MATCH (a:Admin) WHERE a.email = \"" + email +
                "\" RETURN " + this.admin_login_return("a");
            return this.cypher(query)
                .then(this.successOneOrNone, this.error);
        },
        admins_all: function() {
            var query = "MATCH (a:Admin)" +
                " RETURN " + this.admin_return("a");
            return this.cypher(query)
                .then(this.successAll, this.error);
        },
        admin_delete_by_id: function(id) {
        	var query = "MATCH (a:Admin) WHERE id(a) = " + id + " OPTIONAL MATCH (a)-[r]-() DELETE a, r RETURN "+this.admin_delete_return("a");
        	return this.cypher(query)
        		.then(this.successDelete, this.error);
        },
        admin_delete_by_username: function(username) {
            var query = "MATCH (a:Admin { username: \"" + username + "\" }) OPTIONAL MATCH (a)-[r]-() DELETE a, r RETURN "+this.admin_delete_return("a");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        admin_delete_by_email: function(email) {
            var query = "MATCH (a:Admin { email: \"" + email + "\" }) OPTIONAL MATCH (a)-[r]-() DELETE a, r RETURN "+this.admin_delete_return("a");
            return this.cypher(query)
                .then(this.successDelete, this.error);
        },
        admins_purge: function() {
            var query = "MATCH (a:Admin) OPTIONAL MATCH (a)-[r]-() DELETE a, r RETURN "+this.admin_delete_return("a");
            //TODO
        },
        admin_username_taken: function(username) {
            var query = "MATCH (a:Admin) WHERE a.username = \"" + username +
                "\" RETURN " + this.admin_return("a");
            return this.cypher(query)
                .then(this.successTaken, this.error);
        },
        admin_email_taken: function(email) {
            var query = "MATCH (a:Admin) WHERE a.email = \"" + email +
                "\" RETURN " + this.admin_return("a");
            return this.cypher(query)
                .then(this.successTaken, this.error);
        }
    };
    return adminDB;
}