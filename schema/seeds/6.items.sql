-- START FIRST QUERY tba21.items
INSERT INTO tba21.items(
  s3_key,
  machine_recognition_tags,
  created_at,
  updated_at,
  time_produced,
  status,
  concept_tags,
  keyword_tags,
  place,
  country_or_ocean,
  item_type,
  creators,
  contributor,
  directors,
  writers,
  collaborators,
  exhibited_at,
  series,
  isbn,
  edition,
  publisher,
  interviewers,
  interviewees,
  cast_,
  license,
  title,
  description,
  location,
  map_icon
)
VALUES (
  'private/user/key1',
  null,
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'false',
  '{1,2}',
  '{3,4,5}',
  'place',
  'Mediterranean Ocean',
  3,
  '{Chris Alderton, Hilary Rawlings}',
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24',
  '{Grace Hanna, Ashley Brooke}',
  '{Andrea Woodruff, Wade Enyart}',
  '{Jessica Ryan, Alex Ling}',
  'exhibited_at Art Gallery',
  'series 4',
  8591988893,
  1,
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  'cast_, Holly Blackmore, Jay Howe, Dianna Hunter',
  'CC BY',
  'Modeling Complex Systems',
  'description for Modeling Complex Systems',
  ST_GeomFromText('POINT(-34.4039717 150.872567)', 4326),
  '/some-url/'
), (
  'private/user/key2',

  '{
       "rekognition_labels": [
           {
               "Name": "Pet",
               "Parents": [
                   {
                       "Name": "Animal"
                   }
               ],
               "Instances": [],
               "Confidence": 92.20275115966797
           },
           {
               "Name": "Animal",
               "Parents": [],
               "Instances": [],
               "Confidence": 92.20275115966797
           },
           {
               "Name": "Cat",
               "Parents": [
                   {
                       "Name": "Pet"
                   },
                   {
                       "Name": "Mammal"
                   },
                   {
                       "Name": "Animal"
                   }
               ],
               "Instances": [
                   {
                       "Confidence": 89.06988525390625,
                       "BoundingBox": {
                           "Top": 0.015779059380292892,
                           "Left": 0.06638608127832413,
                           "Width": 0.8125336766242981,
                           "Height": 0.9812089204788208
                       }
                   }
               ],
               "Confidence": 92.20275115966797
           },
           {
               "Name": "Mammal",
               "Parents": [
                   {
                       "Name": "Animal"
                   }
               ],
               "Instances": [],
               "Confidence": 92.20275115966797
           },
           {
               "Name": "Abyssinian",
               "Parents": [
                   {
                       "Name": "Pet"
                   },
                   {
                       "Name": "Mammal"
                   },
                   {
                       "Name": "Animal"
                   },
                   {
                       "Name": "Cat"
                   }
               ],
               "Instances": [],
               "Confidence": 89.86946105957031
           },
           {
               "Name": "Manx",
               "Parents": [
                   {
                       "Name": "Pet"
                   },
                   {
                       "Name": "Mammal"
                   },
                   {
                       "Name": "Animal"
                   },
                   {
                       "Name": "Cat"
                   }
               ],
               "Instances": [],
               "Confidence": 85.65826416015625
           }
       ]
   }',

  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{1,2,3}',
  '{4}',
  'place',
  'Atlantic Ocean',
  1,
  '{Ben Scotty, Tim Zerner}',
  'cfa81825-2716-41e2-a48d-8f010840b559',
  '{Naomi Elle, Jacky Chiang}',
  '{Maddie Rush, Jackson weeks}',
  '{Tim Dow, Cerie Tisch}',
  'exhibited_at Moon colony gallery',
  'series 4',
  7688899938157,
  1,
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  'cast_, Holly Blackmore, Jay Howe, Dianna Hunter',
  'CC BY',
  'Detonation',
  'description for Detonation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla.',
  ST_GeomFromText('POINT(-34.4708186 151.2997363)', 4326),
  '/some-url/'
), (
  'private/user/key3',
  null,
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{}',
  '{3,4}',
  'Indonesia',
  'Pacific Ocean',
  1,
  '{Kathleen LaForce, Blair Koch}',
  '851e2447-565a-4032-9920-c99cd581493e',
  '{Aaron Spears, Andy Clark}',
  '{Casey Hanlon, Michael Cleary}',
  '{Tanya Jade, Beth Meredith}',
  'exhibited_at Deep inside a volcano',
  'series 2',
  6888815779993,
  1,
  '{publisher California}',
  '{Rhys Powell, Christine Grove}',
  '{Kylie Smith}',
  'cast_, Marius Quez, Heath Davis',
  'CC BY-NC-ND',
  'Design Patters',
  'description for Design Patterns. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla.',
  ST_GeomFromText('POINT(49.042218 7.528439)', 4326),
  '/some-url/'
),(
  'private/user/key4',
  null,
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{}',
  '{}',
  'Australia',
  '',
 2,
  '{Tim}',
  '81d16d9b-e7da-4d6e-aa13-176820851491',
  '{}',
  '{}',
  '{}',
  'Jupiter base 9',
  '',
  9381577688899,
  1,
  '{publisher Penguin}',
  '{}',
  '{}',
  '',
  'CC BY-NC',
  '',
  'Consectetur adipiscing elit. Morbi non eros pulvinar tortor auctor tincidunt congue quis sem. Donec id sem non neque tincidunt mollis ac sed nulla',
  ST_GeomFromText('POINT(32.7821795 -0.0075471)', 4326),
  '/some-url/'
),(
  'private/user/key5',
  null,
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{}',
  '{3}',
  '',
  'Greece',
  3,
  '{}',
  '23e65916-7cf6-11e9-8f9e-2a86e4085a59',
  '{Grace}',
  '{}',
  '{Andrea}',
  '',
  '',
  8899815776893,
  1,
  '{publisher Harper Collins}',
  '{Coco}',
  '{}',
  '',
  'CC BY-ND',
  '',
  '',
  ST_GeomFromText('POINT(66.073126 4.225375)', 4326),
  '/some-url/'
),
(
  'private/user/key6',
  null,
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'false',
  '{1}',
  '{}',
  '',
  '',
  3,
  '{}',
  '23e65916-7cf6-11e9-8f9e-2a86e4085a59',
  '{}',
  '{}',
  '{}',
  '',
  '',
  7768888159993,
  1,
  '{publisher Harper Collins}',
  '{}',
  '{Kevin Bacon}',
  '',
  'CC BY-SA',
  '',
  'Sed eget nunc facilisis, maximus ex id, viverra dolor. Fusce ut eleifend ex, vel ullamcorper massa. Fusce non erat ut lacus pretium scelerisque. ',
  ST_GeomFromText('POINT(77.134788 4.835309)', 4326),
  '/some-url/'
),
 (
  'private/user/key7',
  null,
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{1, 2}',
  '{1}',
  '',
  '',
  1,
  '{}',
  '23e65916-7cf6-11e9-8f9e-2a86e4085a59',
  '{}',
  '{}',
  '{}',
  '',
  '',
  8889993815776,
  5,
  '{publisher Harper Collins}',
  '{}',
  '{}',
  '',
  'locked',
  'Quantumn Aspects of Life',
  '',
  ST_GeomFromText('POINT(37.717474 161.204097)', 4326),
  '/some-url/'
);
-- END FIRST QUERY tba21.items
