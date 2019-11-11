-- START FIRST QUERY tba21.profiles
INSERT INTO tba21.profiles(
    contributors,
    profile_image,  -- path to s3 object
    featured_image,  -- path to s3 object
    full_name,
    field_expertise,
    city,
    country,
    biography,
    website,
    social_media,
    public_profile,
    affiliation,
    position,
    contact_person,
    contact_position,
    contact_email,
    cognito_uuid,
    profile_type
)
VALUES (
   '{1848329f-004f-4f98-b77a-82992871a539, 236c0d78-bfcc-4645-8383-ef632afcb7c7, 468d8382-54c0-4107-a622-104d8a1134ae}', -- contributors
    'shark.jpg', -- profile_image
    'shark_jump.png', -- featured_image
    'Shark Squad', -- full_name
    'Hexanchus griseus', -- field_expertise
    'Athens', -- city
    'Greece', -- country
    'Ultrices sagittis orci a scelerisque purus semper. Enim tortor at auctor urna nunc id. Sit amet volutpat consequat mauris. Purus sit amet luctus venenatis. ', -- biography
    'https://en.wikipedia.org/wiki/Bluntnose_sixgill_shark', -- website
    '{www.github.come}', -- social_media
    'false', -- public_profile
    'Department of Conservation', -- affiliation
    'Head conservator', -- position
    'Rainer Froese', -- contact_person
    'Head conservator', -- contact_position
    'rainer.froese@email.com', -- contact_email
    '4b5981b0-6897-46de-b36e-1ebd125fc1cb', -- cognito_uuid
    'Collective'  -- profile_type
),
(
   '{4b5981b0-6897-46de-b36e-1ebd125fc1cb}', -- contributors
    'deep_sea_crab.jpg', -- profile_image
    null, -- featured_image
    'Richie Kirkbridge', -- full_name
    'Marine Biology', -- field_expertise
    'Takanabe Formation', -- city
    'Japan', -- country
    'A cras semper auctor neque vitae tempus quam pellentesque. Nisi scelerisque eu ultrices vitae auctor eu augue ut. Enim nec dui nunc mattis.', -- biography
    'https://en.wikipedia.org/wiki/Japanese_spider_crab', -- website
    '{www.facebook.com, www.github.com}', -- social_media
    'true', -- public_profile
    'Animal Diversity Web', -- affiliation
    null, -- position
    'Dan Wood', -- contact_person
    'Mail man', -- contact_position
    'danwood@email.com', -- contact_email
    '81d16d9b-e7da-4d6e-aa13-176820851491', -- cognito_uuid
    'Individual'  -- profile_type
),
(
   '{81d16d9b-e7da-4d6e-aa13-176820851491}', -- contributors
    null, -- profile_image
    null, -- featured_image
    'Nate Swobs', -- full_name
    'Marine ', -- field_expertise
    null, -- city
    null, -- country
    null, -- biography
    'https://github.com/', -- website
    '{www.facebook.com}', -- social_media
    'false', -- public_profile
    null, -- affiliation
    null, -- position
    null, -- contact_person
    null, -- contact_position
    null, -- contact_email
    '236c0d78-bfcc-4645-8383-ef632afcb7c7', -- cognito_uuid
    'Institution'  -- profile_type
);
-- END FIRST QUERY tba21.profile

