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
  '{Lorenzo Botavara, Qui Huynh, Jesse Overmyer}', --c ast_
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
  '2018-01-09 06:30:30+05',
  '2018-06-12 06:30:30+05',
  '2013-10-01 06:30:30+05',
  '2013-10-03 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{2}',
  '{3,4}',
  'Bolivia',
  'Orinoco river basins',
  '{Bolivia, Colombia}',
  '{Creators, Nate Sowerby, Emily Pulleine}',
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19}',
  '{Directors,  Tim Zerner, Stuart Buttigieg}',
  '{Writers, Jacob Ye, Rhett Barker}',
  'Ryan Ewem',
  '{Meghan Ellis, Gary Sansone}',
  '{Ocean Space}',
  'Pink River Dolphins',
  '{9781234567897}',
  1,
  '{Dolphin Publisher}',
  '{Isabelle Vem, Trenton Voytko}',
  '{Abby James}',
  '{Lorenzo Botavara, Qui Huynh, Jesse Overmyer}',
  'The Lives of Pink River Dolphins',
  'Morbi non eros',
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla.',
  'Nathan Sowerby',
  'Amazon',
  'Marine Life',
  'Dolphins',
  null,
  'Nathan Sowerby',
  'The Institution of Nature',
  'Zephyr',
  'Orinoco river basin',
  'https://www.worldwildlife.org/species/amazon-river-dolphin',
  '{Holly Bradbury, Blake Fell, Jim Dow}',
  '{Ilusiolandia Salon}',
  null,
  '{Todd Wade}',
  'Expedition',
  '{WWF}',
  '0',
  '1',
  '1',
  'https://github.com/',
  ST_GeomFromText('GeometryCollection(MULTIPOINT((18.7529761 32.9925062 0.1),(18.7529761 32.9925062 0.8),(18.7529761 32.9925062 0), (15.129618 33.6651781 1.1), (11.7153658 34.1945449 0.2)))',4326)
),
(
  '2019-10-22 06:30:30+05',
  '2019-10-22 06:30:30+05',
  '2019-10-22 06:30:30+05',
  '2019-10-22 06:30:30+05',
  '2019-10-22 06:30:30+05',
  'true',
  '{2}',
  '{3,4}',
  null,
  null,
  null,
  null,
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19}',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  'Expedition',
  null,
  '0',
  '1',
  '1',
  '',
  ST_GeomFromText('GeometryCollection(MULTILINESTRING((-3.1446621 67.7215184 0,-3.1446621 67.7215184 0,-3.1446621 67.7215184 0.1, -3.1446621 67.7215184 -0.1, -3.1446621 67.7215184 0),(-18.9759057 67.1106356 0,-18.9759057 67.1106356 0, -18.9759057 67.1106356 1.1)))',4326)
  );

  -- END FIRST QUERY tba21.collections
