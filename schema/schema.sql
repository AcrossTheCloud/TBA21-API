-- SCHEMA: tba21

--DROP SCHEMA IF EXISTS tba21 CASCADE;
CREATE SCHEMA tba21
AUTHORIZATION postgres;

-- Geospatial support
CREATE EXTENSION IF NOT EXISTS postgis;

--License
CREATE TYPE tba21.licence_type AS ENUM ('CC BY', 'CC BY-SA', 'CC BY-ND', 'CC BY-NC', 'CC BY-NC-SA', 'CC BY-NC-ND', 'locked');

--Table Types
CREATE TYPE tba21.table_type AS ENUM ('Profile', 'Item', 'Collection');

--Profile Types
CREATE TYPE tba21.profile_type AS ENUM ('Individual', 'Collective', 'Institution' );

--Item Types
CREATE TYPE tba21.item_type AS ENUM ('Video', 'Text', 'Audio', 'Image');

--Item subtypes
CREATE TYPE tba21.item_subtype AS ENUM (
  'Music', 'Performance', 'Sound Art', 'Lecture', 'Radio', 'Interview', 'Field Recording', 'Podcast',
  'Academic Public', 'Article', 'News', 'Policy Paper', 'Report', 'Book', 'Essay', 'Historical Text', 'Event Press', 'Toolkit', 'Other',
  'Movie', 'Documentary', 'Art', 'Journalism', 'Event Recording', 'Informational Video', 'Trailer',
  'Artwork Documentation', 'Raw Footage', 'Photograph', 'Research', 'Digital Art', 'Graphics', 'Map', 'Film Still', 'Sculpture',
  'Painting', 'Illustration'
 );

--Collection types
CREATE TYPE tba21.collection_type AS ENUM (
'Series', 'Area of research', 'Event', 'Edited Volume', 'Expedition', 'Collection', 'Convening', 'Performance', 'Installation', 'Other');

-- Items metadata table
CREATE TABLE tba21.items
(
  ID bigserial,
	s3_key varchar(1024) PRIMARY KEY NOT NULL,
	sha512 char(128),
  exif jsonb, -- for exif data
	machine_recognition_tags jsonb,
	md5 char(32),
	image_hash char(64),
	created_at timestamp with time zone NOT NULL,
	updated_at timestamp with time zone NOT NULL,
	time_produced timestamp with time zone,
	status boolean, -- false=draft, true=public
	concept_tags bigint[],
	keyword_tags bigint[],
	place varchar(128)[],
	country_or_ocean varchar(128)[],
	item_type tba21.item_type, --ref to
	item_subtype tba21.item_subtype[],
	creators varchar(256)[],
	contributor uuid,
	directors varchar(256)[],
	writers varchar(256)[],
	editor varchar(256),
  featured_in varchar(256),
	collaborators varchar(256)[],
	exhibited_at varchar(256),
	series varchar(256),
	ISBN numeric(13)[],
	DOI varchar(1024),
	edition numeric(3),
	year_produced numeric(4),
	volume numeric(4),
	issue numeric(4),
	pages numeric(5),
	city_of_publication varchar(128),
	disciplinary_field varchar(256),
	publisher varchar(256)[],
	interviewers varchar(256)[],
	interviewees varchar(256)[],
	cast_ varchar(256),
	license tba21.licence_type,
	title varchar(256),
	subtitle varchar(256),
	description varchar(1024),
	map_icon varchar(1024), -- path to s3 object
  focus_arts numeric(1),
  focus_action numeric(1),
  focus_scitech numeric(1),
  article_link varchar(256),
  translated_from varchar(256),
  language varchar(5), --ref to iso codes
  birth_date date,
  death_date date,
  venue varchar(256)[],
  screened_at varchar(256),
  genre varchar(128),
  news_outlet varchar(256),
  institution varchar(256),
  medium varchar(128),
  dimensions varchar(128),
  recording_technique varchar(256),
  original_sound_credit varchar(256),
  record_label varchar(256),
  series_name varchar(256),
  episode_name varchar(256),
  episode_number numeric(3),
  recording_name varchar(256),
  speakers varchar(256)[],
  performers varchar(256)[],
  host_organization varchar(256)[],
  radio_station varchar(256),
  other_metadata varchar(256),
  item_name varchar(256),
  original_title varchar(256),
  related_event varchar(256),
  volume_in_series numeric(4),
  organisation varchar(256),
  OA_highlight boolean,
  TBA21_material boolean,
  OA_original boolean,
  lecturer varchar(256),
  author varchar(256),
  credit varchar(256),
  copyright_holder varchar(256),
	copyright_country varchar(256),
	created_for varchar(256),
	duration numeric(4),
  interface varchar(256),
  document_code varchar(256),
  project varchar(256),
  journal varchar(256),
  event_title varchar(256),
  recording_studio varchar(256),
  original_text_credit varchar(256)
);

--Collections metadata
CREATE TABLE tba21.collections
(
	ID bigserial PRIMARY KEY,
	created_at timestamp with time zone NOT NULL,
	updated_at timestamp with time zone NOT NULL,
  start_date date,
  end_date date,
	time_produced timestamp with time zone,
	status boolean,
	concept_tags bigint[],
	keyword_tags bigint[],
	place varchar(128),
	regional_focus varchar(128),
	country_or_ocean varchar(128),
	creators varchar(256)[],
	contributors uuid[],
	directors varchar(256)[],
	writers varchar(256)[],
	editor varchar(256),
	collaborators varchar(256),
	exhibited_at varchar(256),
	series varchar(256),
	ISBN numeric(13)[],
	edition numeric(3),
	publisher varchar(256)[],
	interviewers varchar(256)[],
	interviewees varchar(256)[],
	cast_ varchar(256)[],
	title varchar(256),
	subtitle varchar(256),
	description varchar(1024),
	copyright_holder varchar(256),
	copyright_country varchar(256),
	disciplinary_field varchar(256),
  specialization varchar(256),
  department varchar(256),
  expedition_leader varchar(256),
  institution varchar(256),
  expedition_vessel varchar(256),
  expedition_route varchar(256),
  expedition_blog_link varchar(256),
  map_icon varchar(1024), -- path to s3 object
  participants varchar(256)[],
  venue varchar(256)[],
  curator varchar(265),
  host varchar(256)[],
  type tba21.collection_type,
  host_organization varchar(256)[],
  focus_arts numeric(1),
  focus_action numeric(1),
  focus_scitech numeric(1),
  url varchar(256),
  related_material bigint[],
  license tba21.licence_type,
  location varchar(256),
  other_metadata varchar(256)
);

--Contributor metadata
CREATE TABLE tba21.profile
(
	ID bigserial PRIMARY KEY,
  contributors uuid[],
  profile_image varchar(1024),  -- path to s3 object
  featured_image varchar(1024),  -- path to s3 object
  full_name varchar(256),
  field_expertise varchar(256),
  city varchar(128),
  country varchar(128),
  biography varchar(1024),
  website varchar(256),
  social_media varchar(256)[],
  public_profile boolean,
  affiliation varchar(256),
  position varchar(256),
  contact_person varchar (256),
  contact_position varchar (256),
  contact_email varchar (256),
  profile_type tba21.profile_type
);

--Table for making short urls
CREATE TABLE tba21.short_paths
(
  short_path varchar(256) PRIMARY KEY,
  ID bigserial,
  object_type tba21.table_type
);

-- Geo stuff

SELECT AddGeometryColumn ('tba21','items','location',4326,'POINT',2); -- items location column
CREATE INDEX items_gix ON tba21.items USING GIST (location); -- items location GIST index

SELECT AddGeometryColumn ('tba21','collections','geom',4326,'LINESTRING',2); -- collections geom column
CREATE INDEX collections_gix ON tba21.collections USING GIST (geom); -- collections geom GIST index

SELECT AddGeometryColumn ('tba21','collections','expedition_start_point',4326,'POINT',2); -- items location column
CREATE INDEX collections_start_gix ON tba21.collections USING GIST (geom); -- items location GIST index

SELECT AddGeometryColumn ('tba21','collections','expedition_end_point',4326,'POINT',2); -- items location column
CREATE INDEX collections_end_gix ON tba21.collections USING GIST (geom); -- items location GIST index

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
ALTER TABLE tba21.short_paths ADD CONSTRAINT short_path_name UNIQUE (short_path);

