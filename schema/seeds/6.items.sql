-- START FIRST QUERY tba21.items
INSERT INTO tba21.items(
  s3_key,
  sha512,
  authors,
  exif,
  machine_recognition_tags,
  md5,
  image_hash,
  created_at,
  updated_at,
  time_produced,
  status,
  concept_tags,
  keyword_tags,
  place,
  country_or_ocean,
  item_type,
  item_subtype,
  creators,
  contributor,
  directors,
  writers,
  editor,
  featured_in,
  collaborators,
  exhibited_at,
  series,
  ISBN,
  DOI,
  edition,
  year_produced,
  volume,
  pages,
  city_of_publication,
  disciplinary_field,
  publisher,
  interviewers,
  interviewees,
  cast_ ,
  license,
  title,
  subtitle,
  description,
  map_icon, -- path to s3 object
  focus_arts,
  focus_action,
  focus_scitech,
  article_link,
  translated_from,
  language,
  birth_date,
  death_date,
  venues,
  screened_at,
  genre,
  news_outlet,
  institution ,
  medium,
  dimensions,
  recording_technique,
  original_sound_credit,
  record_label,
  series_name,
  episode_name,
  episode_number,
  recording_name,
  speakers,
  performers,
  host_organization,
  radio_station,
  other_metadata,
  geom
)
VALUES (
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad749e30-a6a0-11e9-b5d9-1726307e8330-photo-1518791841217-8f162f1e1131.jpeg',
  'e29d2f333f2251a14ccfae3b7fea5412dd0f5947a122e341a4e0b6f4e13a09929545295f2bab25f6dfb745f34f9bccb55c6869ad99e23ce7f0e3d5b0ac796b06',
  '{John Jameson, John Jameson II}',
  null,
  '  {
  "rekognition_labels": [
  {
  "Name": "Manx",
  "Confidence": 98.5950698852539
  },
  {
  "Name": "Cat",
  "Confidence": 98.5950698852539
  },
  {
  "Name": "Mammal",
  "Confidence": 98.5950698852539
  },
  {
  "Name": "Pet",
  "Confidence": 98.5950698852539
  },
  {
  "Name": "Animal",
  "Confidence": 98.5950698852539
  },
  {
  "Name": "Abyssinian",
  "Confidence": 93.30171966552734
  },
  {
  "Name": "Kitten",
  "Confidence": 87.65930938720703
  }
  ]
  }',
  'a59b8656c03acc0c9745d2c515dc7364',
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'false',
  '{1,2,7,6}',
  '{8,5,1}',
  '{Place}',
  '{Mediterranean Ocean}',
  'Video',
  'Sound Art',
  '{Chris Alderton, Hilary Rawlings}',
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24',
  '{Grace Hanna, Ashley Brooke}',
  '{Andrea Woodruff, Wade Enyart}',
  '{Jessica Ryan, Alex Ling}',
  'featured in',
  '{collaborators}',
  'exhibited_at Art Gallery',
  'series 4',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  1992,
  1,
  7956,
  'Published in city',
  'Explosives',
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  'cast_, Holly Blackmore, Jay Howe, Dianna Hunter',
  'CC BY',
  'Modeling Complex Systems',
  'Subtitle for modeling complex systems',
  'description for Modeling Complex Systems',
  'map/path',
  '1',
  '2',
  '3',
  'https://github.com/',
  null,
  'en',
  null,
  null,
  '{venue}',
  'screened-at',
  'horror',
  'WIN-tv',
  'UOW',
  'Oil on canvas',
  '1024 x 10',
  'Recording technique',
  'Original sound credit',
  'Record label',
  'Series name',
  'Episode name',
  6,
  'Recording name',
  '{Speakers}',
  '{Performers1, Performers2}',
  '{Host organization}',
  'Radio Station',
  '{"other":"Other Data"}',
  ST_GeomFromText('POINT(37.717474 161.204097)', 4326)
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg',
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',
  '{John JamesonIII, John Jameson IV}',
  null,
  ' {
  "rekognition_labels": [
  {
  "Name": "Whale",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Mammal",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Sea Life",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Animal",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Shark",
  "Confidence": 73.06554412841797
  },
  {
  "Name": "Fish",
  "Confidence": 73.06554412841797
  }
  ]
  }',
  'a59b8656c03acc0c9745d2c515dc7364',
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{6,2,4}',
  '{1,4,2,6}',
  '{Place}',
  '{Atlantic Ocean}',
  'Video',
  'Sound Art',
  '{Ben Scotty, Tim Zerner}',
  'cfa81825-2716-41e2-a48d-8f010840b559',
  '{Naomi Elle, Jacky Chiang}',
  '{Maddie Rush, Jackson weeks}',
  '{Tim Dow, Cerie Tisch}',
  'featured in',
  '{collaborators}',
  'exhibited_at Art Gallery',
  'series 4',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  1992,
  1,
  7956,
  'Published in city',
  'Explosives',
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  'cast_, Holly Blackmore, Jay Howe, Dianna Hunter',
  'CC BY',
  'Detonation',
  'Subtitle for  Detonation',
  'description for Detonation',
  'map/path',
  '1',
  '2',
  '3',
  'https://github.com/',
  null,
  'en',
  null,
  null,
  '{venue}',
  'screened-at',
  'horror',
  'WIN-tv',
  'UOW',
  'Oil on canvas',
  '1024 x 10',
  'Recording technique',
  'Original sound credit',
  'Record label',
  'Series name',
  'Episode name',
  6,
  'Recording name',
  '{Speakers}',
  '{Performers1, Performers2}',
  '{Host organization}',
  'Radio Station',
  '{"other":"Other Data"}',
  ST_GeomFromText('POINT(77.134788 4.835309)', 4326)
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-cat-pet-animal-domestic-104827.jpeg',
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',
  '{}',
  null,
  ' {
  "rekognition_labels": [
  {
  "Name": "Whale",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Mammal",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Sea Life",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Animal",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Shark",
  "Confidence": 73.06554412841797
  },
  {
  "Name": "Fish",
  "Confidence": 73.06554412841797
  }
  ]
  }',
  'a59b8656c03acc0c9745d2c515dc7364',
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{1,2,3,4,5,6,7}',
  '{3}',
  '{Place}',
  '{Red Ocean}',
  'Video',
  'Music',
  '{Ben Scotty, Tim Zerner}',
  'cfa81825-2716-41e2-a48d-8f010840b559',
  '{Naomi Elle, Jacky Chiang}',
  '{Maddie Rush, Jackson weeks}',
  '{Tim Dow, Cerie Tisch}',
  'featured in',
  '{collaborators}',
  'exhibited_at Art Gallery',
  'series 4',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  1992,
  1,
  7956,
  'Published in city',
  'Explosives',
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  'cast_, Holly Blackmore, Jay Howe, Dianna Hunter',
  'CC BY',
  'Detonation',
  'Subtitle for  Detonation',
  'description for Detonation',
  'map/path',
  '1',
  '2',
  '3',
  'https://github.com/',
  null,
  'en',
  null,
  null,
  '{venue}',
  'screened-at',
  'horror',
  'WIN-tv',
  'UOW',
  'Oil on canvas',
  '1024 x 10',
  'Recording technique',
  'Original sound credit',
  'Record label',
  'Series name',
  'Episode name',
  6,
  'Recording name',
  '{Speakers}',
  '{Performers1, Performers2}',
  '{Host organization}',
  'Radio Station',
  '{"other":"Other Data"}',
  ST_GeomFromText('POINT(66.073126 4.225375)', 4326)
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg',
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',
  '{John JamesonIIV, John Jameson IIIV}',
  null,
  ' {
  "rekognition_labels": [
  {
  "Name": "Whale",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Mammal",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Sea Life",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Animal",
  "Confidence": 97.81773376464844
  },
  {
  "Name": "Shark",
  "Confidence": 73.06554412841797
  },
  {
  "Name": "Fish",
  "Confidence": 73.06554412841797
  }
  ]
  }',
  'a59b8656c03acc0c9745d2c515dc7364',
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'false',
  '{}',
  '{}',
  '{Place}',
  '{Mediterranean Ocean}',
  'Video',
  'Sound Art',
  '{Chris Alderton, Hilary Rawlings}',
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24',
  '{Grace Hanna, Ashley Brooke}',
  '{Andrea Woodruff, Wade Enyart}',
  '{Jessica Ryan, Alex Ling}',
  'featured in',
  '{collaborators}',
  'exhibited_at Art Gallery',
  'series 4',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  1992,
  1,
  7956,
  'Published in city',
  'Explosives',
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  'cast_, Holly Blackmore, Jay Howe, Dianna Hunter',
  'CC BY',
  'Modeling Complex Systems',
  'Subtitle for modeling complex systems',
  'description for Modeling Complex Systems',
  'map/path',
  '1',
  '2',
  '3',
  'https://github.com/',
  null,
  'en',
  null,
  null,
  '{venue}',
  'screened-at',
  'horror',
  'WIN-tv',
  'UOW',
  'Oil on canvas',
  '1024 x 10',
  'Recording technique',
  'Original sound credit',
  'Record label',
  'Series name',
  'Episode name',
  6,
  'Recording name',
  '{Speakers}',
  '{Performers1, Performers2}',
  '{Host organization}',
  'Radio Station',
  '{"other":"Other Data"}',
  ST_GeomFromText('POINT(32.7821795 -0.0075471)', 4326)
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg',
  'e29d2f333f2251a14ccfae3b7fea5412dd0f5947a122e341a4e0b6f4e13a09929545295f2bab25f6dfb745f34f9bccb55c6869ad99e23ce7f0e3d5b0ac796b06',
  '{John Johningson, John J Jamieson}',
  null,
  '  {
  "rekognition_labels": [
    {
      "Name": "Manx",
      "Confidence": 98.5950698852539
    },
    {
      "Name": "Cat",
      "Confidence": 98.5950698852539
    },
    {
      "Name": "Mammal",
      "Confidence": 98.5950698852539
    },
    {
      "Name": "Pet",
      "Confidence": 98.5950698852539
    },
    {
      "Name": "Animal",
      "Confidence": 98.5950698852539
    },
    {
      "Name": "Abyssinian",
      "Confidence": 93.30171966552734
    },
    {
      "Name": "Kitten",
      "Confidence": 87.65930938720703
    }
  ]
  }',
  'a59b8656c03acc0c9745d2c515dc7364',
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'false',
  '{1,2,7,6}',
  '{8,5,1}',
  '{Place}',
  '{Ocean}',
  'Video',
  'Sound Art',
  '{Chris Alderton, Hilary Rawlings}',
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24',
  '{Grace Hanna, Ashley Brooke}',
  '{Andrea Woodruff, Wade Enyart}',
  '{Jessica Ryan, Alex Ling}',
  'featured in',
  '{collaborators}',
  'exhibited_at Art Gallery',
  'series 4',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  1992,
  1,
  7956,
  'Published in city',
  'Explosives',
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  'cast_, Holly Blackmore, Jay Howe, Dianna Hunter',
  'CC BY',
  'Modeling Complex Systems',
  'Subtitle for modeling complex systems',
  'description for Modeling Complex Systems',
  'map/path',
  '1',
  '2',
  '3',
  'https://github.com/',
  null,
  'en',
  null,
  null,
  '{venue}',
  'screened-at',
  'horror',
  'WIN-tv',
  'UOW',
  'Oil on canvas',
  '1024 x 10',
  'Recording technique',
  'Original sound credit',
  'Record label',
  'Series name',
  'Episode name',
  6,
  'Recording name',
  '{Speakers}',
  '{Performers1, Performers2}',
  '{Host organization}',
  'Radio Station',
  '{"other":"Other Data"}',
  ST_GeomFromText('POINT(49.042218 7.528439)', 4326)
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg',
  'e29d2f333f2251a14ccfae3b7fea5412dd0f5947a122e341a4e0b6f4e13a09929545295f2bab25f6dfb745f34f9bccb55c6869ad99e23ce7f0e3d5b0ac796b06',
  '{John Johningson II, John J Jamieson II}',
  null,
  null,
  'a59b8656c03acc0c9745d2c515dc7364',
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  '2011-07-01 06:30:30+05',
  'true',
  '{2}',
  '{5}',
  '{}',
  '{}',
  'Text',
  'Lecture',
  '{}',
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24',
  '{}',
  '{}',
  '{}',
  '',
  '{}',
  '',
  '',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  1992,
  1,
  7956,
  '',
  '',
  '{}',
  '{}',
  '{}',
  '',
  'CC BY',
  '',
  '',
  '',
  '',
  '1',
  '2',
  '3',
  '',
  null,
  'Ger',
  null,
  null,
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
  6,
  '',
  '{}',
  '{}',
  '{}',
  '',
  '{"other":"Other Data"}',
  ST_GeomFromText('POINT(-34.4708186 151.2997363)', 4326)
);
-- END FIRST QUERY tba21.items
