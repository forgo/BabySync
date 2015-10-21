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
COLLECT(DISTINCT(f)) AS multiParentNodsDel,
COLLECT(DISTINCT(tAT))+
COLLECT(DISTINCT(aMB))+
COLLECT(DISTINCT(bRO))+
COLLECT(DISTINCT(bTB))+
COLLECT(DISTINCT(pRF)) AS onlyParentRelsDel,
COLLECT(DISTINCT(t))+
COLLECT(DISTINCT(a))+
COLLECT(DISTINCT(b))+ 
COLLECT(DISTINCT(f)) AS onlyParentNodsDel
WITH p, multiParentRelsDel, multiParentNodsDel, onlyParentRelsDel, onlyParentNodsDel,
CASE nOtherParents
WHEN 0
THEN {rels:onlyParentRelsDel, nods:onlyParentNodsDel}
ELSE {rels:multiParentRelsDel, nods:multiParentNodsDel}
END AS deletable
FOREACH(r in deletable.rels | DELETE r)
FOREACH(n in deletable.nods | DELETE n)
WITH p AS pdetach