DROP TABLE tba21.concept_tags;

  CREATE TABLE tba21.concept_tags
  (
    ID bigserial PRIMARY KEY,
    tag_name varchar(128)
  );

ALTER TABLE tba21.concept_tags ADD CONSTRAINT concept_tag_name UNIQUE (tag_name);
INSERT INTO tba21.concept_tags (tag_name) VALUES ('activism'),('adapatation at sea'),('adaption at sea'),('anthropocene'),('aquaculture'),('atmospheric phenomena'),('atmospheric phenomenon'),('biodiversity'),('capitalism'),('claiming the ocean (geopolitics)'),('climate change'),('coastal areas'),('colonialism'),('education'),('epistemologies'),('epistemology'),('food'),('form (metadata)'),('gender'),('governance'),('history'),('human'),('humanity'),('humans at sea'),('identities'),('identity'),('indigenous peoples'),('industries'),('industry'),('infrastructures'),('island worlds'),('justice'),('labor'),('livelihoods'),('marine ecosystems'),('marine geology'),('marine widlife'),('marine wildlife'),('mobilities'),('mythology'),('ocean circulation'),('ocean health'),('ocean pollution'),('representation'),('research tools'),('resource extraction'),('rules & regulations'),('rules + regulations'),('seawater properties'),('social'),('spectacle'),('speculative future'),('speculative futures'),('underwater technology'),('vertical water column'),('vulnerability'),('waste');
