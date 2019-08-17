DROP TABLE tba21.concept_tags;

  CREATE TABLE tba21.concept_tags
  (
    ID bigserial PRIMARY KEY,
    tag_name varchar(128)
  );

ALTER TABLE tba21.concept_tags ADD CONSTRAINT concept_tag_name UNIQUE (tag_name);
INSERT INTO tba21.concept_tags (tag_name) VALUES ('colonialism'),('resource extraction'),('representation'),('humans at sea'),('rules & regulations'),('island worlds'),('activism'),('marine ecosystems'),('Vertical Water Column'),('claiming the ocean (geopolitics)'),('underwater technology'),('marine geology'),('research'),('ocean pollution'),('infrastructures'),('anthropocene'),('indigenous peoples'),('mythology'),('climate change'),('biodiversity'),('history'),('epistemologies'),('governance'),('waste'),('industries'),('mobilities'),('justice'),('coastal areas'),('vulnerability'),('identities'),('labor'),('gender'),('livelihoods'),('human'),('speculative futures'),('social'),('adaption at sea'),('aquaculture'),('atmospheric phenomena'),('capitalism'),('marine wildlife'),('ocean circulation'),('ocean health'),('seawater properties');
