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
    contact_email
)
VALUES (
   '{1848329f-004f-4f98-b77a-82992871a539, 236c0d78-bfcc-4645-8383-ef632afcb7c7, 468d8382-54c0-4107-a622-104d8a1134ae}',
    'profile_image',
    'featured_image',
    'full_name',
    'field_expertise',
    'city',
    'country',
    'biography',
    'website',
    '{social_media}',
    'false',
    'affiliation',
    'position',
    'contact_person',
    'contact_position',
    'contact_email'
),
(
   '{4b5981b0-6897-46de-b36e-1ebd125fc1cb}',
    'profile_image',
    'featured_image',
    'Richie Kirkbridge',
    'Marine Biology',
    'Australia',
    'nsw',
    'biography',
    'https://github.com/',
    '{www.facebook.com}',
    'true',
    'affiliation',
    'position',
    'Dan Wood',
    'Mail man',
    'danwood@email.com'
),
(
   '{81d16d9b-e7da-4d6e-aa13-176820851491}',
    '',
    '',
    'Nate Swobs',
    'Marine ',
    '',
    '',
    '',
    'https://github.com/',
    '{www.facebook.com}',
    'false',
    '',
    '',
    '',
    '',
    ''
);
-- END FIRST QUERY tba21.profile

