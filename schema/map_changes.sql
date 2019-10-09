-- Drop the previous geometry columns
ALTER TABLE tba21.items DROP IF EXISTS geom ;
ALTER TABLE tba21.items DROP IF EXISTS linestring ;

ALTER TABLE tba21.collections DROP IF EXISTS geom;
ALTER TABLE tba21.collections DROP IF EXISTS point;

ALTER TABLE tba21.collections DROP IF EXISTS expedition_start_point;
ALTER TABLE tba21.collections DROP IF EXISTS expedition_end_point;

-- Add the new geometry columns and their index
SELECT AddGeometryColumn ('tba21','items','geom',4326,'GEOMETRYCOLLECTION', 3);
CREATE INDEX items_geom_gix ON tba21.items USING GIST (geom);

SELECT AddGeometryColumn ('tba21','collections','geom',4326,'GEOMETRYCOLLECTION', 3);
CREATE INDEX collections_geom_gix ON tba21.collections USING GIST (geom);