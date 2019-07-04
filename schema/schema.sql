-- SCHEMA: tba21

--DROP SCHEMA IF EXISTS tba21 CASCADE;

CREATE SCHEMA tba21
AUTHORIZATION postgres;

-- Geospatial support
CREATE EXTENSION IF NOT EXISTS postgis;

--License
CREATE TYPE tba21.licence_type AS ENUM ('CC BY', 'CC BY-SA', 'CC BY-ND', 'CC BY-NC', 'CC BY-NC-SA', 'CC BY-NC-ND', 'locked');

--Types metadata
CREATE TABLE tba21.types
(
	ID bigserial PRIMARY KEY,
	type_name varchar(256)
);

-- Items metadata table
CREATE TABLE tba21.items
(
	s3_key varchar(1024) PRIMARY KEY NOT NULL ,
	sha512 char(128),
    exif jsonb, -- for things that don't go into other columns
	machine_recognition_tags jsonb,
	md5 char(32),
	image_hash char(64),
	created_at timestamp with time zone NOT NULL,
	updated_at timestamp with time zone NOT NULL,
	time_produced timestamp with time zone,
	status boolean, -- false=draft, true=public
	concept_tags bigint[],
	keyword_tags bigint[],
	place varchar(128),
	country_or_ocean varchar(128),
	item_type bigint references tba21.types(id) ON DELETE CASCADE,
	creators varchar(256)[],
	contributor uuid,
	directors varchar(256)[],
	writers varchar(256)[],
	collaborators varchar(256),
	exhibited_at varchar(256),
	series varchar(256),
	ISBN numeric(13),
	edition numeric(3),
	publisher varchar(256)[],
	interviewers varchar(256)[],
	interviewees varchar(256)[],
	cast_ varchar(256),
	license tba21.licence_type,
	title varchar(256),
	description varchar(256),
	map_icon varchar(1024) -- path to s3 object
);

--Collections metadata
CREATE TABLE tba21.collections
(
	ID bigserial PRIMARY KEY,
	created_at timestamp with time zone NOT NULL,
	updated_at timestamp with time zone NOT NULL,
	time_produced timestamp with time zone,
	status boolean,
	concept_tags bigint[],
	keyword_tags bigint[],
	place varchar(128),
	country_or_ocean varchar(128),
	creators varchar(256)[],
	contributor uuid,
	directors varchar(256)[],
	writers varchar(256)[],
	collaborators varchar(256),
	exhibited_at varchar(256),
	series varchar(256),
	ISBN numeric(13),
	edition numeric(3),
	publisher varchar(256)[],
	interviewers varchar(256)[],
	interviewees varchar(256)[],
	cast_ varchar(256),
	title varchar(256),
	description varchar(256)
);

-- Geo stuff

SELECT AddGeometryColumn ('tba21','items','location',4326,'POINT',2); -- items location column
CREATE INDEX items_gix ON tba21.items USING GIST (location); -- items location GIST index

SELECT AddGeometryColumn ('tba21','collections','geom',4326,'LINESTRING',2); -- collections geom column
CREATE INDEX collections_gix ON tba21.collections USING GIST (geom); -- collections geom GIST index

-- Collection items cross-references
CREATE TABLE tba21.collections_items
(
	collection_ID bigint references tba21.collections(ID) ON DELETE CASCADE,
	item_s3_key varchar(1024) references tba21.items(s3_key) ON DELETE CASCADE
);

--Concept tags metadata
CREATE TABLE tba21.concept_tags
(
	ID bigserial PRIMARY KEY,
	tag_name varchar(128)
);

--Keyword tags metadata
CREATE TABLE tba21.keyword_tags
(
	ID bigserial PRIMARY KEY,
	tag_name varchar(128)
);


--Updates to schema
ALTER TABLE tba21.keyword_tags ADD CONSTRAINT keyword_tag_name UNIQUE (tag_name);
ALTER TABLE tba21.concept_tags ADD CONSTRAINT concept_tag_name UNIQUE (tag_name);
ALTER TABLE tba21.types ADD CONSTRAINT type_name UNIQUE (type_name);

