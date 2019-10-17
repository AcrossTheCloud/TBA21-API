require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { updateById } from './update';

describe('/admin/collections/update/updateByID', () => {

  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Update everything with an ID 1', async () => {
    const
      requestBody = {
        'id': '1',
        'contributors' : ['1f89f9b6-39bc-416e-899e-ef1a8d656f24'],
        'status': 'true' ,
        'concept_tags': [3, 4],
        'keyword_tags': [1, 3],
        'regions': ['Atlantic'] ,
        'regional_focus': 'Arctic Ocean' ,
        'creators': ['creators'] ,
        'directors': ['directors1, directors2'],
        'writers': ['writers'],
        'editor': 'editor',
        'collaborators': ['collaborators'] ,
        'exhibited_at': ['exhibited at'],
        'series': '',
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
        'volume': '',
        'number': '2',
        'geometry': { point: ['-34.4079211 150.8802055 17.82', '-34.4077234 150.8778021 16.58', '-34.4077234 150.8778021 16.57'],
          linestring: ['-34.4017631 150.9086573 13.82, -34.4017631 150.9086573 13.83, -34.4017631 150.9086573 13.82, -34.4017631 150.9086573 13.82, -34.4017631 150.9086573 13.82']},
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg'],
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
  });
  test('Update one item in the collection with an ID 1', async () => {
    const
      requestBody = {
        'id': '1',
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg'],
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
  });
  test('Remove all items from collection ID 1', async () => {
    const
      requestBody = {
        'id': '1',
        'items': [],
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
  });
  test('Update collection ID 1 with two items', async () => {
    const
      requestBody = {
        'id': '1',
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg',   'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg'],
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
  });
  test('Check that supplying just the id returns a 400', async () => {
    const
      requestBody = { 'id': '1' },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.message).toEqual('Nothing to update');
  });

  test('Get a bad response when no id is given', async () => {
    const
      requestBody = { 'id': '' },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent);

    expect(response.statusCode).toEqual(400);
  });
});
