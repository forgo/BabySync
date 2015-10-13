// DELETE Admins with duplicate usernames

MATCH (a:Admin)
WITH a.username AS username, collect(a) AS nodes
WHERE size(nodes) > 1
FOREACH (a in tail(nodes) | DELETE a)


// Create uniqueness constraint

// To create a constraint that makes sure that your database will never contain 
// more than one node with a specific label and one property value, use the IS UNIQUE syntax.
// e.g -

CREATE CONSTRAINT ON (book:Book) ASSERT book.isbn IS UNIQUE

CREATE CONSTRAINT ON (a:Admin) ASSERT a.username IS UNIQUE
CREATE CONSTRAINT ON (a:Admin) ASSERT a.email IS UNIQUE


// Drop uniqueness constraint

// By using DROP CONSTRAINT, you remove a constraint from the database.

DROP CONSTRAINT ON (book:Book) ASSERT book.isbn IS UNIQUE

DROP CONSTRAINT ON (a:Admin) ASSERT a.username IS UNIQUE
DROP CONSTRAINT ON (a:Admin) ASSERT a.email IS UNIQUE

// Create a node that complies with constraints

// Create a Book node with an isbn that isn’t already in the database.

CREATE (book:Book { isbn: '1449356265', title: 'Graph Databases' })

