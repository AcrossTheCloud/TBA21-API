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
  linestring
)
VALUES (
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{2}',
  '{3,4}',
  'Place',
  'Regional focus',
  '{Atlantic Ocean}',
  '{Creators, Jacob Yeo, Tim Zerner}',
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19, cfa81825-2716-41e2-a48d-8f010840b559}',
  '{Directors, Nate Sowerby, Stuart Buttigieg}',
  '{Writers, Emily Pulleine, Rhett Barker}',
  'Editor',
  '{Collaborators, Meghan Ellis, Gary Sansone}',
  '{exhibited_at}',
  'series',
  '{8157768889992}',
  2,
  '{publisher World Scientific}',
  '{Interviewers, Isabelle Vem, Trenton Voytko}',
  '{Interviewees, Abby James}',
  '{cast_, Lorenzo Botavara, Qui Huynh, Jesse Overmyer}',
  'The Decisive Moment',
  'subtitle',
  'Description of The Decisive Moment. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla.',
  'copyright_holder',
  'copyright_country',
  'disciplinary_field',
  'specialisation',
  'department',
  'expedition_leader',
  'institution',
  'expedition_vessel',
  'expedition_route',
  'expedition_blog_link',
  '{participants}',
  '{venue}',
  'curator',
  '{host}',
  'Event',
  '{host_organisation}',
  '0',
  '2',
  '3',
  'https://github.com/',
  ST_GeomFromText('LINESTRING(-71.160281 42.258729 71.160281,-71.160837 42.259113 71.160281,-71.161144 42.25932 71.160281)', 4326)
),
(
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{2}',
  '{3,4}',
  'Wollongong',
  'Regional',
  '{Red sea}',
  '{Creators, Nate Sowerby, Emily Pulleine}',
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19}',
  '{Directors,  Tim Zerner, Stuart Buttigieg}',
  '{Writers, Jacob Ye, Rhett Barker}',
  'Editor',
  '{Collaborators, Meghan Ellis, Gary Sansone}',
  '{exhibited_at}',
  'series',
  '{8157768889992}',
  2,
  '{publisher World Scientific}',
  '{Interviewers, Isabelle Vem, Trenton Voytko}',
  '{Interviewees, Abby James}',
  '{cast_, Lorenzo Botavara, Qui Huynh, Jesse Overmyer}',
  'The Decisive Moment',
  'subtitle',
  'Description of The Decisive Moment. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla.',
  'copyright_holder',
  'copyright_country',
  'disciplinary_field',
  'specialisation',
  'department',
  'expedition_leader',
  'institution',
  'expedition_vessel',
  'expedition_route',
  'expedition_blog_link',
  '{participants}',
  '{venue}',
  'curator',
  '{host}',
  'Event',
  '{host_organisation}',
  '0',
  '2',
  '3',
  'https://github.com/',
  ST_GeomFromText('LINESTRING(-71.160281 42.258729 71.160281,-71.160837 42.259113 71.160281,-71.161144 42.25932 71.160281)', 4326)
),
(
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{2}',
  '{3,4}',
  'Place',
  '',
  '{}',
  '{}',
  '{7e32b7c6-c6d3-4e70-a101-12af2df21a19}',
  '{}',
  '{}',
  '',
  '{}',
  '{}',
  '',
  '{8157768889992}',
  2,
  '{}',
  '{}',
  '{}',
  '{}',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '{}',
  '{}',
  '',
  '{}',
  'Event',
  '{}',
  '0',
  '2',
  '3',
  '',
  ST_GeomFromText('LINESTRING(-71.160281 42.258729 71.160281,-71.160837 42.259113 71.160281,-71.161144 42.25932 71.160281)', 4326)
  );

  -- END FIRST QUERY tba21.collections
