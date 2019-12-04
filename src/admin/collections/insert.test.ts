require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { createCollection } from './insert';

describe('/admin/collections/insert/', () => {

  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Create an empty collection without items', async () => {
    const
      requestBody = {
        'year_produced': '1992',
        'start_date': '2019-02-22 10:53',
        'title': 'title',
        'regional_focus': 'regional_Arctic Ocean',
        'description': 'description',
        'institution': 'Wollongong uni',
        'type': '',
        'focus_arts': '1',
        'focus_action': '2',
        'focus_scitech': '3',
        'concept_tags' : [3],
        'geojson': {'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {}, 'geometry': {'type': 'Polygon', 'coordinates': [[[-220.913086, 55.416544, 1], [-220.737305, 54.711929, 1.01], [-219.660645, 54.635697, 1], [-218.254395, 54.686534, 1.01], [-218.803711, 55.37911, 1.2], [-219.396973, 55.862982, 1.1], [-220.539551, 55.838314, 1.6], [-220.913086, 55.416544, 1]]]}}, {'type': 'Feature', 'properties': {}, 'geometry': {'type': 'Point', 'coordinates': [-12.216797, 5.397273, 0]}}]}
      },
      body: string = JSON.stringify(requestBody),
      response = await createCollection({ body , 'path': '/admin/collections/create' } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
  });

  test('Create a collection with items', async () => {
    const
      requestBody = {
        'cast_': ['test'],
        'contributors' : ['1f89f9b6-39bc-416e-899e-ef1a8d656f24'],
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg'],
        'year_produced': '1992',
        'regional_focus': 'Arctic Ocean',
        'start_date': '2019-02-22 10:53',
        'title': 'title',
        'description': 'description',
        'institution': 'Wollongong uni',
        'type': 'Event',
        'focus_arts': '1',
        'focus_action': '2',
        'focus_scitech': '3',
        'concept_tags' : [3]
      },
      body: string = JSON.stringify(requestBody),
      response = await createCollection({ body , 'path': '/admin/collections/create' } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body),
      nItems = await db.one(`select count(1) from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`, [responseBody.id ]);

    expect(nItems.count).toBe('2');
  });

  test('Create a complete collection with items', async () => {
    const

      requestBody = {
        'start_date': '2019-02-22 10:53',
        'regional_focus': 'Arctic Ocean',
        'status': 'true' ,
        'concept_tags': [3, 4],
        'keyword_tags': [1, 3],
        'regions': ['Atlantic'] ,
        'creators': ['creators'] ,
        'directors': ['directors1, directors2'],
        'writers': ['writers'],
        'editor': 'editor',
        'collaborators': ['collaborators'] ,
        'exhibited_at': ['exhibited at'],
        'series': 'series',
        'isbn': [674316184220],
        'edition': '1',
        'publisher': ['publisher'],
        'interviewers': ['interviewer'],
        'interviewees': ['interviewee'],
        'cast_': ['cast'],
        'title': 'title',
        'subtitle': 'subtitle',
        'description': 'descritption',
        'copyright_holder': 'copyright holder',
        'copyright_country': 'Australia',
        'disciplinary_field': 'disciplinary_field',
        'specialisation': 'specialisation',
        'department': 'department',
        'expedition_leader': 'expedition_leader' ,
        'institution': 'institution',
        'expedition_vessel': 'expedition_vessel',
        'expedition_route': 'expedition_route',
        'expedition_blog_link': 'www.blog.com',
        'participants': ['participants'],
        'venues': ['venue'],
        'curator': 'curator',
        'host': ['host'],
        'event_type': 'event type',
        'type': 'Event',
        'host_organisation': ['host org'],
        'focus_arts': '1',
        'focus_action': '2',
        'focus_scitech': '3',
        'url': 'www.google.com',
        'related_material': [1, 2],
        'license': 'CC BY-ND',
        'location': 'wollongong',
        'year_produced': '1992',
        'media_type': 'photograph',
        'city_of_publication': 'wollongong',
        'digital_only': 'true',
        'related_event': 'related',
        'volume': '1',
        'number': '2',
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg'],
        'collections' : { id : [1, 2] }
      },
      body: string = JSON.stringify(requestBody),
      response = await createCollection({ body, 'path': '/admin/collections/create' } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body),
      nItems = await db.one(`select count(1) from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`, [responseBody.id ]);

    expect(nItems.count).toBe('3');
  });
});
