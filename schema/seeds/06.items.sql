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
  regions,
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
  host_organisation,
  radio_station,
  other_metadata,
  geom
)
VALUES (
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad749e30-a6a0-11e9-b5d9-1726307e8330-photo-1518791841217-8f162f1e1131.jpeg', -- s3_key
  'e29d2f333f2251a14ccfae3b7fea5412dd0f5947a122e341a4e0b6f4e13a09929545295f2bab25f6dfb745f34f9bccb55c6869ad99e23ce7f0e3d5b0ac796b06',   --sha512
  '{John Jameson}', -- authors
  null, -- exif
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
  }', -- machine_recognition_tags
  'a59b8656c03acc0c9745d2c515dc7364', -- md5
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff', -- image_hash
  '2019-10-26 06:30:30+05', -- created_at
  '2019-10-27 06:30:30+05', -- updated_at
  '2015-01-01 06:30:30+05', -- time produced
  'false', -- status
  '{1,2,7,6}', -- concept_tags
  '{8,5,1}', -- keyword_tags
  '{Gorda Escarpment}', -- place
  '{North Pacific Ocean}', -- regions
  'Video', -- item_type
  'Sound Art', -- item_subtype
  '{Chris Alderton, Hilary Rawlings}', -- creators
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24', -- contributor
  '{Grace Hanna, Ashley Brooke}', -- directors
  '{Andrea Woodruff, Wade Enyart}', -- writers
  '{Jessica Ryan, Alex Ling}', -- editor
  'Deep Sea Marine Life', -- featured in
  '{Nicolas Baily, Jeffery Drazen}', -- collaborators
  '{Blob Sculpin Art Gallery}', -- exhibited_at
  'Weird Deep Sea Life', -- series
  '8591988893', -- ISBN
  'doi:10.1002/0470841559.ch1', -- DOI
  5, -- edition
  2019, -- year produced
  1, -- volume
  7956, -- pages
  'California', -- published_in
  'Biology', -- disciplinary_field
  '{FossilWorks}', -- publisher
  '{Hannah Foster, Samantha Fox}', -- interviewers
  '{Dianna Lacey}', -- interviewees
  '{Holly Blackmore, Jay Howe, Dianna Hunter}', -- cast_
  'CC BY', -- license
  'Life of the Blob Sculpin', -- title
  'Blob Sculpin', -- subtitle
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', -- description
  'map/path', -- map_icon
  '1', -- focus_arts
  '0', -- focus_action
  '1', -- focus_scitech
  'https://en.wikipedia.org/wiki/Blob_sculpin', -- article_link
  null, -- translated_from
  'en', -- language
  null, -- birth_date
  null, -- death_date
  '{FishBase}', -- venue
  null, -- screened_at
  'sea-life', -- genre
  null, -- news_outlet
  'UOW', -- institution
  'Oil on canvas', -- medium
  '1024 x 10', -- dimensions
  'Blumlein Pair', -- recording_technique
  'Brian Goffredi', -- original_sound_credit
  'Sony', -- record_label
  'Blob Sculpin', -- series_name
  null, -- episode_name
  null, -- episode_number
  null, -- recording_name
  '{Sabina Cole, Kathleen Cole}', -- speakers
  null, -- performers
  '{WoRM}', -- host_organisation
  null, -- radio_station
  '{"other":"Other Data"}', -- other_metadata
  ST_GeomFromText('GeometryCollection(MULTIPOLYGON(((-154.0895309 56.683104 2, -154.0895309 56.683104 2.1, -154.0895309 56.683104 2.02, -154.0895309 56.683104 2.01, -154.0895309 56.683104 1.99),(-154.0895309 56.683104 1.98, -154.0895309 56.683104 1.88, -154.0895309 56.683104 1.99, -154.0895309 56.683104 1.98, -154.0895309  56.683104 2.00)), ((-153.8570305 56.7385269 2.1, -153.8570305 56.7385269 2.1, -153.8570305 56.7385269 2.111, -153.8570305 56.7385269 1.01, -153.8570305 56.7385269 1.7)) ))',4326) -- geom
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg',
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',
  '{Paul Fowler, Daniel Froese, Francis clinton}',
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
  '2019-12-16 06:30:30+05',
  '2019-12-16 06:30:30+05',
  '2019-08-08 06:30:30+05',
  'true',
  '{6,2,4}',
  '{1,4,2,6}',
  '{Chatham Islands}',
  '{New Zealand}',
  'Image',
  'Photograph',
  '{Ben Scotty, Tim Zerner}',
  'cfa81825-2716-41e2-a48d-8f010840b559',
  '{Naomi Elle, Jacky Chiang}',
  '{Maddie Rush, Jackson weeks}',
  '{Tim Dow, Cerie Tisch}',
  'Shark Focus',
  '{Christopher Consoli}',
  null,
  null,
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  2,
  2019,
  3,
  7956,
  null,
  'Bulletin of the National Science',
  '{Okiyama, M.}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  '{Holly Blackmore, Jay Howe, Dianna Hunter}',
  'CC BY-NC-SA',
  'The Private Life of Sharks',
  'The Truth Behind the Myth',
  null,
  'map/path',
  '1',
  '0',
  '1',
  'https://en.wikipedia.org/wiki/Frilled_shark',
  null,
  'en',
  null,
  null,
  '{ReefQuest Centre}',
  'ReefQuest Centre',
  'Australian Sea Life',
  'Zootaxa',
  'Centre for Shark Research',
  'Photograpoh',
  '1024 x 10',
  null,
  null,
  null,
  'The Rise of Modern Sharks',
  'Sharks of the World',
  3,
  null,
  '{Christopher Smart}',
  '{Pauly Rainer}',
  '{ReefQuest Centre for Shark Research}',
  null,
  '{"other":"Other Data"}',
  ST_GeomFromText('GeometryCollection(POINT(-162.2900390625 57.136239319177434 0), POINT(-166.9482421875 54.87660665410869 0), POINT(-172.44140625 53.199451902831555 0), POINT(-179.033203125 52.669720383688166 0))',4326)
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
  '2019-03-13 06:30:30+05',
  '2019-03-05 06:30:30+05',
  '2019-02-07 06:30:30+05',
  'true',
  '{1,2,3,4,5,6,7}',
  '{3}',
  '{Azores, Monterey Bay, Oregon, Philippines, Marthas Vineyard, Papua New Guinea}',
  '{New Zealand}',
  'Text',
  'Essay',
  '{Ben Scotty, Tim Zerner}',
  'cfa81825-2716-41e2-a48d-8f010840b559',
  '{Naomi Elle, Jacky Chiang}',
  '{Maddie Rush, Jackson weeks}',
  '{Tim Dow, Cerie Tisch}',
  'Finned Deep-sea Octopuses',
  '{Martin Collins, Stavro Hadjisolomou}',
  '{National Oceanic and Atmospheric Administration.}',
  'Grimpoteuthis',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  null,
  2019,
  1,
  7956,
  'The Vineyard',
  'Taxonomy, ecology and behavior of the cirrate octopods',
  '{Taylor and Francis}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  '{Holly Blackmore, Jay Howe, Dianna Hunter}',
  'Ocean Archive',
  'Dumbo Octopus',
  null,
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'map/path',
  '1',
  '1',
  '0',
  'https://github.com/',
  null,
  'en',
  null,
  null,
  null,
  null,
  'Taxonomy',
  null,
  null,
  'Text',
  null,
  null,
  null,
  null,
  'Oceanography and Marine Biology:',
  null,
  44,
  null,
  '{Marco Petkovic}',
  '{Martin Collins}',
  '{Aquarium of the Pacific.}',
  null,
  '{"other":"Other Data"}',
  ST_GeomFromText('GeometryCollection(POLYGON((-220.9130859375 55.416543608580064 1.0, -220.73730468749997 54.71192884840614 1.01,-219.66064453124997 54.635697306063854 1.0,-218.25439453125 54.686534234529695 1.01, -218.80371093749997 55.3791104480105 1.2, -219.39697265624997 55.86298231197633 1.1, -220.53955078125 55.83831352210821 1.6, -220.9130859375 55.416543608580064 1.9)))',4326)
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg',
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',
  '{/chen Kou, Mike Krumboltz, Niele Wetzer}',
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
  '2019-07-01 06:30:30+05',
  '2019-09-03 06:30:30+05',
  '2019-01-08 06:30:30+05',
  'false',
  '{}',
  '{}',
  '{Brazil}',
  '{Gulf of Mexico}',
  'Audio',
  'Sound Art',
  '{Chris Alderton, Hilary Rawlings}',
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24',
  '{Grace Hanna, Ashley Brooke}',
  '{Andrea Woodruff, Wade Enyart}',
  '{Jessica Ryan, Alex Ling}',
  'Aspects of the biology of the giant isopod Bathynomus giganteus',
  '{Milne Edwards}',
  '{National Institute of Water and Atmospheric Research. }',
  'Bathynomus, A living Sea monster',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  1992,
  1,
  7956,
  'Mexico',
  'Bathynomus giganteus',
  '{publisher Penguin}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  '{cast_, Holly Blackmore, Jay Howe, Dianna Hunter}',
  'CC BY',
  'Modeling Complex Systems',
  'Subtitle for modeling complex systems',
  'description for Modeling Complex Systems',
  'map/path',
  '1',
  '1',
  '0',
  'https://github.com/',
  null,
  'en',
  null,
  null,
  null,
  null,
  'Marine Science',
  'ResearchGate',
  'UOW',
  'Polaroid',
  '1024 x 10',
  'X/Y Stereo Recording',
  'Mikulka Holthuis',
  null,
  'I Wont Eat, You Cant Make Me! (And They Couldnt)',
  null,
  36,
  null,
  null,
  '{Jack Gallagher, Milne Edwards, Martin Kuck}',
  null,
  null,
  '{"other":"Other Data"}',
  ST_GeomFromText('GeometryCollection(POINT(150.8802055 -34.4079211 0))',4326)
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
  '2019-05-21 06:30:30+05',
  '2019-05-21 06:30:30+05',
  '2019-03-17 06:30:30+05',
  'false',
  '{1,2,7,6}',
  '{8,5,1}',
  '{Japan}',
  '{Miocene of Japan}',
  'PDF',
  'Historical Text',
  '{Chris Alderton, Hilary Rawlings}',
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24',
  '{Grace Hanna, Ashley Brooke}',
  '{Andrea Woodruff, Wade Enyart}',
  '{Jessica Ryan, Alex Ling}',
  null,
  '{Kazutoshi Okamoto}',
  '{International Wildlife Museum}',
  'Crabs of Japan',
  '8591988893',
  'doi:10.1002/0470841559.ch1',
  5,
  2019,
  1,
  7956,
  'Oregon ',
  'Crustations',
  '{Göteborgs Universitet}',
  '{Hannah Foster, Samantha Fox}',
  '{Dianna Lacey}',
  '{Holly Blackmore, Jay Howe, Dianna Hunter}',
  'CC BY-NC',
  'Influence of temperature on survival and growth of larvae of the giant spider crab',
  'Crustacea, Decapoda, Majidae',
  'Libero justo laoreet sit amet cursus. Duis convallis convallis tellus id interdum velit laoreet id donec. Aenean et tortor at risus. Ipsum a arcu cursus vitae congue mauris rhoncus. Sed risus ultricies tristique nulla aliquet enim tortor at. Nunc mattis enim ut tellus elementum. ',
  'map/path',
  '0',
  '1',
  '0',
  'https://en.wikipedia.org/wiki/Japanese_spider_crab',
  null,
  'en',
  null,
  null,
  null,
  null,
  null,
  'Spider crab',
  'the Paleontological Society of Japan.',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  6,
  null,
  '{Maurice Burton, Robert Burton}',
  null,
  '{The Paleontological Society of Japan}',
  null,
  '{"other":"Other Data"}',
  ST_GeomFromText('GeometryCollection(POINT(-310.4736328125 -20.282808691330054 1), POINT(-308.7158203125 -22.532853707527117 0.2), POINT(-305.859375 -20.694461597907782 0.1), POINT(-303.11279296875 -19.394067895396613 0),  POINT(150.88067293167114 -34.40549336030763 0) )',4326)
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg',
  'e29d2f333f2251a14ccfae3b7fea5412dd0f5947a122e341a4e0b6f4e13a09929545295f2bab25f6dfb745f34f9bccb55c6869ad99e23ce7f0e3d5b0ac796b06',
  '{/L. Baltzly}',
  null,
  null,
  'a59b8656c03acc0c9745d2c515dc7364',
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff',
  '2014-07-01 06:30:30+05',
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
  '{}',
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
  '{}',
  'CC BY',
  '',
  '',
  '',
  '',
  '1',
  '1',
  '0',
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
  -- Melbourne to Tasmania to Christchurch
  ST_GeomFromText('GeometryCollection(LINESTRING(-421.4794921875 18.562947442888312 12, -419.326171875 15.368949896534705 3, -419.0625 12.511665400971031 4, -419.2822265625 10.401377554543553 5, -417.392578125 8.53756535080403 4, -415.283203125 8.146242825034385 3,  -414.40429687499994 7.972197714386879 2 ))',4326)
);
-- END FIRST QUERY tba21.items
