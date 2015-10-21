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
WHERE p.email = 'kenobi@farfaraway.net' AND id(fnew) = 24 AND id(f) <> 24
WITH p, pRF, f, fnew
OPTIONAL MATCH 
(pO:Parent)-[pORF:RESPONSIBLE_FOR]->(f)
WHERE pO.email <> 'kenobi@farfaraway.net'
WITH p, pRF, f, fnew, COUNT(pO) AS nOtherParents

OPTIONAL MATCH
(t:Timer)-[tAT:ADHERES_TO]->(a:Activity)-[aMB:MANAGED_BY]->(f)<-[bRO:RESPONSIBILITY_OF]-(b:Baby)-[bTB:TRACKED_BY]->(t)

// UNWIND a AS amerge
// MATCH (tmerge)-[tAT]


MERGE (tnew)-[:ADHERES_TO]->(anew)-[:MANAGED_BY]->(fnew)<-[:RESPONSIBILITY_OF]-(bnew)-[:TRACKED_BY]->(tnew)
ON MATCH SET tnew = t, anew = a, bnew = b
ON CREATE SET a.name = a.name + " (" + p.name + ")"





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
RETURN fmerge