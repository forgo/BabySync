// CREATE


CREATE (p:Parent {parent})-[:RESPONSIBLE_FOR]->(f:Family {family}),
	   (a1:Activity {activity1})-[:MANAGED_BY]->(f),
	   (a2:Activity {activity2})-[:MANAGED_BY]->(f),
	   (a3:Activity {activity3})-[:MANAGED_BY]->(f),
	   (b:Baby {baby})-[:RESPONSIBILITY_OF]->(f),
	   (b)-[:TRACKED_BY]->(t1:Timer {timer1})-[:ADHERES_TO]->(a1),
	   (b)-[:TRACKED_BY]->(t2:Timer {timer2})-[:ADHERES_TO]->(a2),
	   (b)-[:TRACKED_BY]->(t3:Timer {timer3})-[:ADHERES_TO]->(a3)
WITH p.facebookID AS lookup
MATCH (p:Parent)-[:RESPONSIBLE_FOR]->
      (f:Family)<-[:MANAGED_BY]-
      (a:Activity)<-[:ADHERES_TO]-
      (t:Timer)<-[:TRACKED_BY]-
      (b:Baby)-[:RESPONSIBILITY_OF]->(f)
WHERE p.facebookID = lookup
WITH { id: id(f), name: f.name } AS family,
COLLECT( DISTINCT { 
	id: id(p), 
	facebookID: p.facebookID, 
	name: p.name, 
	email: p.email, 
	created_on: p.created_on, 
	updated_on: p.updated_on 
} ) AS parents,
COLLECT( DISTINCT { 
	id: id(a), 
	name: a.name, 
	icon: a.icon,
	warn: a.warn, 
	critical: a.critical, 
	created_on: a.created_on, 
	updated_on: a.updated_on 
} ) AS activities,
b,
COLLECT( DISTINCT { 
	id: id(t), 
	resetDate: t.resetDate, 
	enabled: t.enabled,
	push: t.push,
	created_on: a.created_on, 
	updated_on: a.updated_on 
} ) AS timers
RETURN family, parents, activities, COLLECT( DISTINCT { name: b.name, timers: timers }) AS babies


RETURN { id: id(f), name: f.name, created_on: f.created_on, updated_on: f.updated_on } AS family, " +
                "COLLECT({ id: id(p), facebookID: p.facebookID, name: p.name, email: p.email, created_on: p.created_on, updated_on: p.updated_on }) AS parents, " +
                "COLLECT({ id: id(a1), name: a1.name, icon: a1.icon, warn: a1.warn, critical: a1.critical, created_on: a1.created_on, updated_on: a1.updated_on }) " +
                "+ COLLECT({ id: id(a2), name: a2.name, icon: a2.icon, warn: a2.warn, critical: a2.critical, created_on: a2.created_on, updated_on: a2.updated_on }) " +
                "+ COLLECT({ id: id(a3), name: a3.name, icon: a3.icon, warn: a3.warn, critical: a3.critical, created_on: a3.created_on, updated_on: a3.updated_on }) AS activities, " +
                "COLLECT({ id: id(b), name: b.name, created_on: b.created_on, updated_on: b.updated_on }) as babies "
// MATCH

MATCH (p:Parent)-[:RESPONSIBLE_FOR]->
      (f:Family)<-[:MANAGED_BY]-
      (a:Activity)<-[:ADHERES_TO]-
      (t:Timer)<-[:TRACKED_BY]-
      (b:Baby)-[:RESPONSIBILITY_OF]->(f)
WHERE p.facebookID = "123456789"
WITH { id: id(f), name: f.name } AS family,
COLLECT( DISTINCT { 
	id: id(p), 
	facebookID: p.facebookID, 
	name: p.name, 
	email: p.email, 
	created_on: p.created_on, 
	updated_on: p.updated_on 
} ) AS parents,
COLLECT( DISTINCT { 
	id: id(a), 
	name: a.name, 
	icon: a.icon,
	warn: a.warn, 
	critical: a.critical, 
	created_on: a.created_on, 
	updated_on: a.updated_on 
} ) AS activities,
b,
COLLECT( DISTINCT { 
	id: id(t), 
	resetDate: t.resetDate, 
	enabled: t.enabled,
	push: t.push,
	created_on: a.created_on, 
	updated_on: a.updated_on 
} ) AS timers
RETURN family, parents, activities, COLLECT( DISTINCT { name: b.name, timers: timers }) AS babies

