  -- START FIRST QUERY tba21.collections

INSERT INTO tba21.collections(
  created_at,
  updated_at,
  start_date,
  end_date,
  time_produced,
  status,
  concept_tags,
  keyword_tags,
  place,
  regional_focus,
  regions,
  creators,
  contributors,
  directors,
  writers,
  editor,
  collaborators,
  exhibited_at,
  series,
  ISBN,
  edition,
  publisher,
  interviewers,
  interviewees,
  cast_,
  title,
  subtitle,
  description,
  copyright_holder,
  copyright_country,
  disciplinary_field,
  specialisation,
  department,
  expedition_leader,
  institution,
  expedition_vessel,
  expedition_route,
  expedition_blog_link,
  participants,
  venues,
  curator,
  host,
  type,
  host_organisation,
  focus_arts,
  focus_action,
  focus_scitech,
  url,
  geom
)
VALUES (
  '2019-10-19 06:30:30+05', -- created_at
  '2019-10-19 06:30:30+05', -- updated_at
  '2018-09-06 06:30:30+05', -- start_date
  '2018-12-01 06:30:30+05', -- end_date
  '2019-10-19 06:30:30+05', -- time_produced
  'true', -- status
  '{2, 6, 3}', -- concept tags
  '{3, 4, 10, 6}', -- keyword_tags
  'Wollongong', -- place
  'Illawarra', --regional_focus
  '{Atlantic Ocean}', -- regions
  '{Jacob Yeo, Tim Zerner}', -- creators
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19, cfa81825-2716-41e2-a48d-8f010840b559}', -- contributors
  '{Nate Sowerby, Stuart Buttigieg}', -- directors
  '{Writers, Emily Pulleine, Rhett Barker}', -- writers
  'Alex Ling', -- editor
  '{Meghan Ellis, Gary Sansone}', -- collaborators
  '{Wollongong Art gallery}', -- exhibited at
  'Australian Sea Life', -- series
  '{8157768889992}', -- ISBN
  2, -- edition
  '{World Scientific}', -- publisher
  '{Isabelle Vem, Trenton Voytko}', -- interviewers
  '{Abby James}', -- Interviewees
  '{Lorenzo Botavara, Qui Huynh, Jesse Overmyer}', -- cast_
  'The Decisive Moment', -- title
  'A conclusive moment in time', -- subtitle
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla.', -- Description
  'Zara Glynn', -- copyright holder
  'Australia', -- copyright country
  'Marine Biology', -- disciplinary_field
  'Thick Seals, really chunky lads', -- specialisation
  'Department of foreign affairs', -- department
  'Zara Glynn', -- expedition_leader
  'IMB', -- institution
  'The Dreamweaver', -- expedition vessel
  'south-eastern coast of Australia', -- expedition_route
  'https://www.jervisbaywild.com.au/blog/things-you-didnt-know-seals/', -- expedition_blog_link
  '{Zara Glynn}', -- participants
  '{venue}', -- venues
  'Dan Wood', -- curator
  '{Dan Wood}', -- host
  'Area of research', -- type
  '{University of Wollongong}', -- host_organisation
  '0', -- focus_arts
  '1', -- focus_action
  '0', -- focus_scietch
  'https://github.com/', -- url
  ST_GeomFromText('GeometryCollection(POLYGON((151.2586795 -33.9504117 1, 151.2586795 -33.9504117 1.1, 151.2586795 -33.9504117 0.9, 151.2586795 33.9504117 0.999,151.2586795 -33.9504117 0.97)))',4326) --geom
),
(
  '2018-01-09 06:30:30+05', -- created_at
  '2018-06-12 06:30:30+05', -- updated_at
  '2013-10-01 06:30:30+05', -- start_date
  '2013-10-03 06:30:30+05', -- end_date
  '2011-07-01 06:30:30+05', -- time_produced
  'true', -- status
  '{2}', -- concept tags
  '{3,4}', -- keyword_tags
  'Bolivia', -- place
  'Orinoco river basins', --regional_focus
  '{Bolivia, Colombia}', -- regions
  '{Creators, Nate Sowerby, Emily Pulleine}', -- creators
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19}', -- contributors
  '{Directors,  Tim Zerner, Stuart Buttigieg}', -- directors
  '{Writers, Jacob Ye, Rhett Barker}', -- writers
  'Ryan Ewem', -- editor
  '{Meghan Ellis, Gary Sansone}', -- collaborators
  '{Ocean Space}', -- exhibited at
  'Pink River Dolphins', -- series
  '{9781234567897}', -- ISBN
  1, -- edition
  '{Dolphin Publisher}', -- publisher
  '{Isabelle Vem, Trenton Voytko}', -- interviewers
  '{Abby James}', -- Interviewees
  '{Lorenzo Botavara, Qui Huynh, Jesse Overmyer}', -- cast_
  'The Lives of Pink River Dolphins', -- title
  'Morbi non eros', -- subtitle
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla.', -- Description
  'Nathan Sowerby', -- copyright holder
  'Amazon', -- copyright country
  'Marine Life', -- disciplinary_field
  'Dolphins', -- specialisation
  null, -- department
  'Nathan Sowerby', -- expedition_leader
  'The Institution of Nature', -- institution
  'Zephyr', -- expedition vessel
  'Orinoco river basin', -- expedition_route
  'https://www.worldwildlife.org/species/amazon-river-dolphin', -- expedition_blog_link
  '{Holly Bradbury, Blake Fell, Jim Dow}', -- participants
  '{Ilusiolandia Salon}', -- venues
  null, -- curator
  '{Todd Wade}', -- host
  'Expedition', -- type
  '{WWF}', -- host_organisation
  '0', -- focus_arts
  '1', -- focus_action
  '1', -- focus_scietch
  'https://github.com/', -- url
  ST_GeomFromText('GeometryCollection(POINT(150.87981462478635 -34.40621921511202 0), POINT( 150.8818531036377 -34.40749387172319 0), POINT(150.87457895278928 -34.40646706652969 0))',4326) --geom
),
(
  '2019-10-22 06:30:30+05', -- created_at
  '2019-10-22 06:30:30+05', -- updated_at
  '2019-10-22 06:30:30+05', -- start_date
  '2019-10-22 06:30:30+05', -- end_date
  '2019-10-22 06:30:30+05', -- time_produced
  'true', -- status
  '{2}', -- concept tags
  '{3,4}', -- keyword_tags
  null, -- place
  null, --regional_focus
  null, -- regions
  null, -- creators
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19}', -- contributors
  null, -- directors
  null, -- writers
  null, -- editor
  null, -- collaborators
  null, -- exhibited at
  null, -- series
  null, -- ISBN
  null, -- edition
  null, -- publisher
  null, -- interviewers
  null, -- Interviewees
  null, -- cast_
  null, -- title
  null, -- subtitle
  null, -- Description
  null, -- copyright holder
  null, -- copyright country
  null, -- disciplinary_field
  null, -- specialisation
  null, -- department
  null, -- expedition_leader
  null, -- institution
  null, -- expedition vessel
  null, -- expedition_route
  null, -- expedition_blog_link
  null, -- participants
  null, -- venues
  null, -- curator
  null, -- host
  'Expedition', -- type
  null, -- host_organisation
  '0', -- focus_arts
  '1', -- focus_action
  '1', -- focus_scietch
  '', -- url
  ST_GeomFromText('GeometryCollection(LINESTRING(150.94013214111328 -34.43777895433789 12, 150.937385559082 -34.4643910293177 3, 150.94459533691403 -34.47712785074852 4, 150.9789276123047 -34.50768829003379 12, 150.941162109375 -34.5235300339023 4))',4326) --geom
  );

  -- END FIRST QUERY tba21.collections
