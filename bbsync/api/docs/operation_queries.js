// DETACH
MATCH 
(p:Parent)-[pRF:RESPONSIBLE_FOR]->(f:Family)
WHERE p.email = 'luke@farfaraway.net'
WITH p, pRF, f
OPTIONAL MATCH 
(pO:Parent)-[pORF:RESPONSIBLE_FOR]->(f)
WHERE pO.email <> 'luke@farfaraway.net'
WITH p, pRF, f, COUNT(pO) AS nOtherParents
OPTIONAL MATCH
(t:Timer)-[tAT:ADHERES_TO]->(a:Activity)-[aMB:MANAGED_BY]->(f)<-[bRO:RESPONSIBILITY_OF]-(b:Baby)-[bTB:TRACKED_BY]->(t)
WITH p, pRF, f, nOtherParents,
COLLECT(DISTINCT(pRF)) AS multiParentRelsDel,
COLLECT(DISTINCT(tAT))+
COLLECT(DISTINCT(aMB))+
COLLECT(DISTINCT(bRO))+
COLLECT(DISTINCT(bTB))+
COLLECT(DISTINCT(pRF)) AS onlyParentRelsDel,
COLLECT(DISTINCT(t))+
COLLECT(DISTINCT(a))+
COLLECT(DISTINCT(b))+ 
COLLECT(DISTINCT(f)) AS onlyParentNodsDel
WITH p, nOtherParents, onlyParentRelsDel, onlyParentNodsDel, multiParentRelsDel,
CASE nOtherParents
WHEN 0
THEN {rels:onlyParentRelsDel, nods:onlyParentNodsDel}
ELSE {rels:multiParentRelsDel, nods:[]}
END AS deletable
FOREACH(r in deletable.rels | DELETE r)
FOREACH(n in deletable.nods | DELETE n)
WITH p AS pdetach

// JOIN
MATCH 
(p:Parent)-[pRF:RESPONSIBLE_FOR]->(f:Family),
(fnew:Family)
WHERE p.email = 'luke@farfaraway.net' AND id(fnew) = 123 AND id(f) <> 123
WITH p, pRF, f, fnew
OPTIONAL MATCH 
(pO:Parent)-[pORF:RESPONSIBLE_FOR]->(f)
WHERE pO.email <> 'luke@farfaraway.net'
WITH p, pRF, f, fnew, COUNT(pO) AS nOtherParents
OPTIONAL MATCH
(t:Timer)-[tAT:ADHERES_TO]->(a:Activity)-[aMB:MANAGED_BY]->(f)<-[bRO:RESPONSIBILITY_OF]-(b:Baby)-[bTB:TRACKED_BY]->(t)
WITH p, pRF, f, fnew, nOtherParents,
COLLECT(DISTINCT(pRF)) AS multiParentRelsDel,
COLLECT(DISTINCT(tAT))+
COLLECT(DISTINCT(aMB))+
COLLECT(DISTINCT(bRO))+
COLLECT(DISTINCT(bTB))+
COLLECT(DISTINCT(pRF)) AS onlyParentRelsDel,
COLLECT(DISTINCT(t))+
COLLECT(DISTINCT(a))+
COLLECT(DISTINCT(b))+ 
COLLECT(DISTINCT(f)) AS onlyParentNodsDel
WITH p, fnew, nOtherParents, onlyParentRelsDel, onlyParentNodsDel, multiParentRelsDel,
CASE nOtherParents
WHEN 0
THEN {rels:onlyParentRelsDel, nods:onlyParentNodsDel}
ELSE {rels:multiParentRelsDel, nods:[]}
END AS deletable
FOREACH(r in deletable.rels | DELETE r)
FOREACH(n in deletable.nods | DELETE n)
CREATE UNIQUE (p)-[:RESPONSIBLE_FOR]->(fnew)
WITH DISTINCT(p) AS pjoin, fnew AS fjoin

// MERGE
MATCH 
(p:Parent)-[pRF:RESPONSIBLE_FOR]->(f:Family),
(fnew:Family)
WHERE p.email = 'luke@farfaraway.net' AND id(fnew) = 33 AND id(f) <> 33
WITH p, pRF, f, fnew
OPTIONAL MATCH 
(pO:Parent)-[pORF:RESPONSIBLE_FOR]->(f)
WHERE pO.email <> 'luke@farfaraway.net'
WITH p, pRF, f, fnew, COUNT(pO) AS nOtherParents

// Copy parent's activities into new family, 
// parent name appended to activity name property to distinguish those merged
OPTIONAL MATCH 
(a:Activity)-[:MANAGED_BY]->(f)
WITH p, pRF, f, fnew, nOtherParents, COLLECT(DISTINCT(a)) AS activities
UNWIND activities AS activity
CREATE (acopy:Activity)-[:MANAGED_BY]->(fnew)
SET acopy = activity, acopy.name = activity.name + " (" + p.name + ")",
acopy += { copiedFromID: id(activity) }
WITH p, pRF, f, fnew, nOtherParents

// Copy parent's babies into new family,
// parent name appended to baby name property to distinguish those merged
OPTIONAL MATCH 
(b:Baby)-[:RESPONSIBILITY_OF]->(f)
WITH p, pRF, f, fnew, nOtherParents, COLLECT(DISTINCT(b)) AS babies
UNWIND babies AS baby
CREATE (bcopy:Baby)-[:RESPONSIBILITY_OF]->(fnew)
SET bcopy = baby, bcopy.name = baby.name + " (" + p.name + ")"
WITH p, pRF, f, fnew, nOtherParents, baby, bcopy

	// Copy parent's babies' timers into new family,
	// parent name appended to baby name property to distinguish those merged
	OPTIONAL MATCH 
	(baby)-[:TRACKED_BY]->(t:Timer)
	WITH p, pRF, f, fnew, nOtherParents, bcopy, COLLECT(DISTINCT(t)) AS timers
	UNWIND timers AS timer
	CREATE (tcopy:Timer)<-[:TRACKED_BY]-(bcopy)
	SET tcopy = timer
	WITH p, pRF, f, fnew, nOtherParents, timer, tcopy

		// Copy parent's babies' timers relationship with activities
		// relationship preserved w/temp property in previously copied activities
		OPTIONAL MATCH
		(timer)-[:ADHERES_TO]->(a:Activity),
		(acopy:Activity)-[:MANAGED_BY]->(fnew)
		WHERE acopy.copiedFromID = id(a)
		WITH p, pRF, f, fnew, nOtherParents, tcopy, acopy, COLLECT(DISTINCT(a)) AS activities
		UNWIND activities AS activity
		CREATE (tcopy)-[:ADHERES_TO]->(acopy)
		REMOVE acopy.copiedFromID
		WITH p, pRF, f, fnew, nOtherParents

// Now Move Parent and Delete Leftovers Depending on if Single Parent Family
OPTIONAL MATCH
(t:Timer)-[tAT:ADHERES_TO]->(a:Activity)-[aMB:MANAGED_BY]->(f)<-[bRO:RESPONSIBILITY_OF]-(b:Baby)-[bTB:TRACKED_BY]->(t)
WITH p, pRF, f, fnew, nOtherParents,
COLLECT(DISTINCT(pRF)) AS multiParentRelsDel,
COLLECT(DISTINCT(tAT))+
COLLECT(DISTINCT(aMB))+
COLLECT(DISTINCT(bRO))+
COLLECT(DISTINCT(bTB))+
COLLECT(DISTINCT(pRF)) AS onlyParentRelsDel,
COLLECT(DISTINCT(t))+
COLLECT(DISTINCT(a))+
COLLECT(DISTINCT(b))+ 
COLLECT(DISTINCT(f)) AS onlyParentNodsDel
WITH p, fnew, nOtherParents, onlyParentRelsDel, onlyParentNodsDel, multiParentRelsDel,
CASE nOtherParents
WHEN 0
THEN {rels:onlyParentRelsDel, nods:onlyParentNodsDel}
ELSE {rels:multiParentRelsDel, nods:[]}
END AS deletable
FOREACH(r in deletable.rels | DELETE r)
FOREACH(n in deletable.nods | DELETE n)
CREATE UNIQUE (p)-[:RESPONSIBLE_FOR]->(fnew)
WITH DISTINCT(p) AS pmerge, fnew AS fmerge