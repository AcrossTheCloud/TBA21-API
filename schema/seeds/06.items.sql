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
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg', -- s3_key
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',   --sha512
  '{Paul Fowler, Daniel Froese, Francis clinton}', -- authors
  null, -- exif
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
  }', -- machine_recognition_tags
  'a59b8656c03acc0c9745d2c515dc7364', -- md5
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff', -- image_hash
  '2019-12-16 06:30:30+05', -- created_at
  '2019-12-16 06:30:30+05', -- updated_at
  '2019-08-08 06:30:30+05', -- time produced
  'true', -- status
  '{6,2,4}', -- concept_tags
  '{1,4,2,6}', -- keyword_tags
  '{Chatham Islands}', -- place
  '{New Zealand}', -- regions
  'Image', -- item_type
  'Photograph', -- item_subtype
  '{Ben Scotty, Tim Zerner}', -- creators
  'cfa81825-2716-41e2-a48d-8f010840b559', -- contributor
  '{Naomi Elle, Jacky Chiang}', -- directors
  '{Maddie Rush, Jackson weeks}', -- writers
  '{Tim Dow, Cerie Tisch}', -- editor
  'Shark Focus', -- featured in
  '{Christopher Consoli}', -- collaborators
  null, -- exhibited_at
  null, -- series
  '8591988893', -- ISBN
  'doi:10.1002/0470841559.ch1', -- DOI
  2, -- edition
  2019, -- year produced
  3, -- volume
  7956, -- pages
  null, -- published_in
  'Bulletin of the National Science', -- disciplinary_field
  '{Okiyama, M.}', -- publisher
  '{Hannah Foster, Samantha Fox}', -- interviewers
  '{Dianna Lacey}', -- interviewees
  '{Holly Blackmore, Jay Howe, Dianna Hunter}', -- cast_
  'CC BY-NC-SA', -- license
  'The Private Life of Sharks', -- title
  'The Truth Behind the Myth', -- subtitle
  null, -- description
  'map/path', -- map_icon
  '1', -- focus_arts
  '0', -- focus_action
  '1', -- focus_scitech
  'https://en.wikipedia.org/wiki/Frilled_shark', -- article_link
  null, -- translated_from
  'en', -- language
  null, -- birth_date
  null, -- death_date
  '{ReefQuest Centre}', -- venue
  'ReefQuest Centre', -- screened_at
  'Australian Sea Life', -- genre
  'Zootaxa', -- news_outlet
  'Centre for Shark Research', -- institution
  'Photograpoh', -- medium
  '1024 x 10', -- dimensions
  null, -- recording_technique
  null, -- original_sound_credit
  null, -- record_label
  'The Rise of Modern Sharks', -- series_name
  'Sharks of the World', -- episode_name
  3, -- episode_number
  null, -- recording_name
  '{Christopher Smart}', -- speakers
  '{Pauly Rainer}', -- performers
  '{ReefQuest Centre for Shark Research}', -- host_organisation
  null, -- radio_station
  '{"other":"Other Data"}', -- other_metadata
  ST_GeomFromText('GeometryCollection(POINT(-162.2900390625 57.136239319177434 0), POINT(-166.9482421875 54.87660665410869 0), POINT(-172.44140625 53.199451902831555 0), POINT(-179.033203125 52.669720383688166 0))',4326) -- geom
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-cat-pet-animal-domestic-104827.jpeg', -- s3_key
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',   --sha512
  '{}', -- authors
  null, -- exif
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
  }', -- machine_recognition_tags
  'a59b8656c03acc0c9745d2c515dc7364', -- md5
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff', -- image_hash
  '2019-03-13 06:30:30+05', -- created_at
  '2019-03-05 06:30:30+05', -- updated_at
  '2019-02-07 06:30:30+05', -- time produced
  'true', -- status
  '{1,2,3,4,5,6,7}', -- concept_tags
  '{3}', -- keyword_tags
  '{Azores, Monterey Bay, Oregon, Philippines, Marthas Vineyard, Papua New Guinea}', -- place
  '{New Zealand}', -- regions
  'Text', -- item_type
  'Essay', -- item_subtype
  '{Ben Scotty, Tim Zerner}', -- creators
  'cfa81825-2716-41e2-a48d-8f010840b559', -- contributor
  '{Naomi Elle, Jacky Chiang}', -- directors
  '{Maddie Rush, Jackson weeks}', -- writers
  '{Tim Dow, Cerie Tisch}', -- editor
  'Finned Deep-sea Octopuses', -- featured in
  '{Martin Collins, Stavro Hadjisolomou}', -- collaborators
  '{National Oceanic and Atmospheric Administration.}', -- exhibited_at
  'Grimpoteuthis', -- series
  '8591988893', -- ISBN
  'doi:10.1002/0470841559.ch1', -- DOI
  null, -- edition
  2019, -- year produced
  1, -- volume
  7956, -- pages
  'The Vineyard', -- published_in
  'Taxonomy, ecology and behavior of the cirrate octopods', -- disciplinary_field
  '{Taylor and Francis}', -- publisher
  '{Hannah Foster, Samantha Fox}', -- interviewers
  '{Dianna Lacey}', -- interviewees
  '{Holly Blackmore, Jay Howe, Dianna Hunter}', -- cast_
  'Ocean Archive', -- license
  'Dumbo Octopus', -- title
  null, -- subtitle
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', -- description
  'map/path', -- map_icon
  '1', -- focus_arts
  '1', -- focus_action
  '0', -- focus_scitech
  'https://github.com/', -- article_link
  null, -- translated_from
  'en', -- language
  null, -- birth_date
  null, -- death_date
  null, -- venue
  null, -- screened_at
  'Taxonomy', -- genre
  null, -- news_outlet
  null, -- institution
  'Text', -- medium
  null, -- dimensions
  null, -- recording_technique
  null, -- original_sound_credit
  null, -- record_label
  'Oceanography and Marine Biology:', -- series_name
  null, -- episode_name
  44, -- episode_number
  null, -- recording_name
  '{Marco Petkovic}', -- speakers
  '{Martin Collins}', -- performers
  '{Aquarium of the Pacific.}', -- host_organisation
  null, -- radio_station
  '{"other":"Other Data"}', -- other_metadata
  ST_GeomFromText('GeometryCollection(POLYGON((-220.9130859375 55.416543608580064 1.0, -220.73730468749997 54.71192884840614 1.01,-219.66064453124997 54.635697306063854 1.0,-218.25439453125 54.686534234529695 1.01, -218.80371093749997 55.3791104480105 1.2, -219.39697265624997 55.86298231197633 1.1, -220.53955078125 55.83831352210821 1.6, -220.9130859375 55.416543608580064 1.9)))',4326) -- geom
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg', -- s3_key
  '887565faebcdc369d61a04d90f6e229c2ab05f3212ae1a4ea5f6f132152046adba3adc21b0bce802236c03a051e63a2d6f24cbc25bf576a93f423290e276dfee',   --sha512
  '{/chen Kou, Mike Krumboltz, Niele Wetzer}', -- authors
  null, -- exif
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
  }', -- machine_recognition_tags
  'a59b8656c03acc0c9745d2c515dc7364', -- md5
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff', -- image_hash
  '2019-07-01 06:30:30+05', -- created_at
  '2019-09-03 06:30:30+05', -- updated_at
  '2019-01-08 06:30:30+05', -- time produced
  'false', -- status
  '{}', -- concept_tags
  '{}', -- keyword_tags
  '{Brazil}', -- place
  '{Gulf of Mexico}', -- regions
  'Audio', -- item_type
  'Sound Art', -- item_subtype
  '{Chris Alderton, Hilary Rawlings}', -- creators
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24', -- contributor
  '{Grace Hanna, Ashley Brooke}', -- directors
  '{Andrea Woodruff, Wade Enyart}', -- writers
  '{Jessica Ryan, Alex Ling}', -- editor
  'Aspects of the biology of the giant isopod Bathynomus giganteus', -- featured in
  '{Milne Edwards}', -- collaborators
  '{National Institute of Water and Atmospheric Research. }', -- exhibited_at
  'Bathynomus, A living Sea monster', -- series
  '8591988893', -- ISBN
  'doi:10.1002/0470841559.ch1', -- DOI
  5, -- edition
  1992, -- year produced
  1, -- volume
  7956, -- pages
  'Mexico', -- published_in
  'Bathynomus giganteus', -- disciplinary_field
  '{publisher Penguin}', -- publisher
  '{Hannah Foster, Samantha Fox}', -- interviewers
  '{Dianna Lacey}', -- interviewees
  '{cast_, Holly Blackmore, Jay Howe, Dianna Hunter}', -- cast_
  'CC BY', -- license
  'Modeling Complex Systems', -- title
  'Subtitle for modeling complex systems', -- subtitle
  'description for Modeling Complex Systems', -- description
  'map/path', -- map_icon
  '1', -- focus_arts
  '1', -- focus_action
  '0', -- focus_scitech
  'https://github.com/', -- article_link
  null, -- translated_from
  'en', -- language
  null, -- birth_date
  null, -- death_date
  null, -- venue
  null, -- screened_at
  'Marine Science', -- genre
  'ResearchGate', -- news_outlet
  'UOW', -- institution
  'Polaroid', -- medium
  '1024 x 10', -- dimensions
  'X/Y Stereo Recording', -- recording_technique
  'Mikulka Holthuis', -- original_sound_credit
  null, -- record_label
  'I Wont Eat, You Cant Make Me! (And They Couldnt)', -- series_name
  null, -- episode_name
  36, -- episode_number
  null, -- recording_name
  null, -- speakers
  '{Jack Gallagher, Milne Edwards, Martin Kuck}', -- performers
  null, -- host_organisation
  null, -- radio_station
  '{"other":"Other Data"}', -- other_metadata
  ST_GeomFromText('GeometryCollection(POINT(150.8802055 -34.4079211 0))',4326) -- geom
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg', -- s3_key
  'e29d2f333f2251a14ccfae3b7fea5412dd0f5947a122e341a4e0b6f4e13a09929545295f2bab25f6dfb745f34f9bccb55c6869ad99e23ce7f0e3d5b0ac796b06',   --sha512
  '{John Johningson, John J Jamieson}', -- authors
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
  '2019-05-21 06:30:30+05', -- created_at
  '2019-05-21 06:30:30+05', -- updated_at
  '2019-03-17 06:30:30+05', -- time produced
  'false', -- status
  '{1,2,7,6}', -- concept_tags
  '{8,5,1}', -- keyword_tags
  '{Japan}', -- place
  '{Miocene of Japan}', -- regions
  'PDF', -- item_type
  'Historical Text', -- item_subtype
  '{Chris Alderton, Hilary Rawlings}', -- creators
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24', -- contributor
  '{Grace Hanna, Ashley Brooke}', -- directors
  '{Andrea Woodruff, Wade Enyart}', -- writers
  '{Jessica Ryan, Alex Ling}', -- editor
  null, -- featured in
  '{Kazutoshi Okamoto}', -- collaborators
  '{International Wildlife Museum}', -- exhibited_at
  'Crabs of Japan', -- series
  '8591988893', -- ISBN
  'doi:10.1002/0470841559.ch1', -- DOI
  5, -- edition
  2019, -- year produced
  1, -- volume
  7956, -- pages
  'Oregon ', -- published_in
  'Crustations', -- disciplinary_field
  '{Göteborgs Universitet}', -- publisher
  '{Hannah Foster, Samantha Fox}', -- interviewers
  '{Dianna Lacey}', -- interviewees
  '{Holly Blackmore, Jay Howe, Dianna Hunter}', -- cast_
  'CC BY-NC', -- license
  'Influence of temperature on survival and growth of larvae of the giant spider crab', -- title
  'Crustacea, Decapoda, Majidae', -- subtitle
  'Libero justo laoreet sit amet cursus. Duis convallis convallis tellus id interdum velit laoreet id donec. Aenean et tortor at risus. Ipsum a arcu cursus vitae congue mauris rhoncus. Sed risus ultricies tristique nulla aliquet enim tortor at. Nunc mattis enim ut tellus elementum. ', -- description
  'map/path', -- map_icon
  '0', -- focus_arts
  '1', -- focus_action
  '0', -- focus_scitech
  'https://en.wikipedia.org/wiki/Japanese_spider_crab', -- article_link
  null, -- translated_from
  'en', -- language
  null, -- birth_date
  null, -- death_date
  null, -- venue
  null, -- screened_at
  null, -- genre
  'Spider crab', -- news_outlet
  'the Paleontological Society of Japan.', -- institution
  null, -- medium
  null, -- dimensions
  null, -- recording_technique
  null, -- original_sound_credit
  null, -- record_label
  null, -- series_name
  null, -- episode_name
  6, -- episode_number
  null, -- recording_name
  '{Maurice Burton, Robert Burton}', -- speakers
  null, -- performers
  '{The Paleontological Society of Japan}', -- host_organisation
  null, -- radio_station
  '{"other":"Other Data"}', -- other_metadata
  ST_GeomFromText('GeometryCollection(POINT(-310.4736328125 -20.282808691330054 1), POINT(-308.7158203125 -22.532853707527117 0.2), POINT(-305.859375 -20.694461597907782 0.1), POINT(-303.11279296875 -19.394067895396613 0),  POINT(150.88067293167114 -34.40549336030763 0) )',4326) -- geom
),
(
  'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg', -- s3_key
  'e29d2f333f2251a14ccfae3b7fea5412dd0f5947a122e341a4e0b6f4e13a09929545295f2bab25f6dfb745f34f9bccb55c6869ad99e23ce7f0e3d5b0ac796b06',   --sha512
  '{L. Baltzly}', -- authors
  null, -- exif
  null, -- machine_recognition_tags
  'a59b8656c03acc0c9745d2c515dc7364', -- md5
  '9ee38ee380e3a0e2e0f7f0e6d066d006fc0f9c07f007f803f000f000f034ffff', -- image_hash
  '2014-07-01 06:30:30+05', -- created_at
  '2011-07-01 06:30:30+05', -- updated_at
  '2011-07-01 06:30:30+05', -- time produced
  'true', -- status
  '{2}', -- concept_tags
  '{5}', -- keyword_tags
  '{}', -- place
  '{}', -- regions
  'Text', -- item_type
  'Lecture', -- item_subtype
  '{}', -- creators
  '1f89f9b6-39bc-416e-899e-ef1a8d656f24', -- contributor
  '{}', -- directors
  '{}', -- writers
  '{}', -- editor
  '', -- featured in
  '{}', -- collaborators
  '{}', -- exhibited_at
  '', -- series
  '8591988893', -- ISBN
  'doi:10.1002/0470841559.ch1', -- DOI
  5, -- edition
  1992, -- year produced
  1, -- volume
  7956, -- pages
  '', -- published_in
  '', -- disciplinary_field
  '{}', -- publisher
  '{}', -- interviewers
  '{}', -- interviewees
  '{}', -- cast_
  'CC BY', -- license
  '', -- title
  '', -- subtitle
  '', -- description
  '', -- map_icon
  '1', -- focus_arts
  '1', -- focus_action
  '0', -- focus_scitech
  '', -- article_link
  null, -- translated_from
  'Ger', -- language
  null, -- birth_date
  null, -- death_date
  '{}', -- venue
  '', -- screened_at
  '', -- genre
  '', -- news_outlet
  '', -- institution
  '', -- medium
  '', -- dimensions
  '', -- recording_technique
  '', -- original_sound_credit
  '', -- record_label
  '', -- series_name
  '', -- episode_name
  6, -- episode_number
  '', -- recording_name
  '{}', -- speakers
  '{}', -- performers
  '{}', -- host_organisation
  '', -- radio_station
  '{"other":"Other Data"}', -- other_metadata
  -- Melbourne to Tasmania to Christchurch
  ST_GeomFromText('GEOMETRYCOLLECTION Z (POINT Z (150.894124 -34.425669 5215),LINESTRING Z (-421.4794921875 18.562947442888312 12, -419.326171875 15.368949896534705 3, -419.0625 12.511665400971031 4, -419.2822265625 10.401377554543553 5, -417.392578125 8.53756535080403 4, -415.283203125 8.146242825034385 3,  -414.40429687499994 7.972197714386879 2 ))',4326)
);
-- END FIRST QUERY tba21.items
