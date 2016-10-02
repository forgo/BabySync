// Create User Indices and Constraints
CREATE CONSTRAINT ON (u:User) ASSERT u.email IS UNIQUE;
CREATE CONSTRAINT ON (u:User) ASSERT u.username IS UNIQUE;

CREATE CONSTRAINT ON (u:User) ASSERT u.facebookID IS UNIQUE;
CREATE CONSTRAINT ON (u:User) ASSERT u.googleID IS UNIQUE;

CREATE INDEX ON :User(email);
CREATE INDEX ON :User(username);

// Create Parent Indices and Constraints
CREATE CONSTRAINT ON (p:Parent)-[r:RESPONSIBLE_FOR]-(f:Family) ASSERT exists(r.pendingApproval)

// Create Geocache Indices for Better Location Search Performance
CREATE INDEX ON :Geocache(lat);
CREATE INDEX ON :Geocache(lon);

// Wipe Out Database
START n = node(*) 
OPTIONAL MATCH n-[r]-() 
WHERE (ID(n)>0 AND ID(n)<10000) 
DELETE n, r;

START n = node(*) 
OPTIONAL MATCH n-[r]-() 
WHERE (ID(n)>0 AND ID(n)<20000) 
DELETE n, r;

START n = node(*) 
OPTIONAL MATCH n-[r]-() 
WHERE (ID(n)>0 AND ID(n)<30000) 
DELETE n, r;

// Create Users
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:/Users/elliott/code/git/BabySyncProject/bbsync/api/scripts/csv/user.csv" AS row
CREATE (:User {
	username: row.username, 
	firstname: row.firstname, 
	lastname: row.lastname, 
	email: row.email,
	birthday: row.birthday,
	phone: row.phone,
	created_on: row.created_on,
	updated_on: row.updated_on,
	login_on: row.login_on,
	hash: row.hash
});

// Create Geocaches
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:/Users/elliott/code/git/BabySyncProject/bbsync/api/scripts/csv/geocache.csv" AS row
CREATE (:Geocache {
	title: row.title, 
	message: row.message, 
	lat: toFloat(row.lat), 
	lng: toFloat(row.lng),
	currency: row.currency,
	amount: toFloat(row.amount),
	is_physical: (case trim(row.is_physical) when "true" then true else false end),
	delay: toInt(row.delay),
	dropped_on: row.dropped_on
});
