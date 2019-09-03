require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { get, insert, update } from './profiles';
import { QueryStringParameters } from '../../types/_test_';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';

describe('Profile get tests', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Get a profile by its id', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.profiles[0].id).toEqual('2');
  });
  test('Get a profile by its uuid', async () => {
    const
      queryStringParameters: QueryStringParameters = {uuid: '81d16d9b-e7da-4d6e-aa13-176820851491'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.profiles[0].cognito_uuid).toEqual('81d16d9b-e7da-4d6e-aa13-176820851491');
  });
  test('Check that we have a profile with the fullname starting with r', async () => {
    const
      queryStringParameters: QueryStringParameters = {fullname: 'I'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.profiles[0].full_name).toEqual('Richie Kirkbridge');
  });
  test('Create a profile', async () => {
    const
      requestBody = {
        'full_name': 'Zara Glynn',
        'country': 'Australia',
        'public_profile': 'true',
        'contact_email': 'zara@email.com',
        'profile_type': 'Institution'
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
});
  test('update a profile', async () => {
    const
      requestBody = {
        'id': '3',
        'full_name': 'Glynn Zara',
        'country': 'America',
        'public_profile': 'false',
        'profile_type': 'Collective',
        'uuid': '236c0d78-bfcc-4645-8383-ef632afcb7c7'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({ body, 'path': '/admin/profiles/update' } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual({'success': true});
  });
  test('update a profile completely', async () => {
    const
      requestBody = {
        'id': '3',
        'uuid' : '236c0d78-bfcc-4645-8383-ef632afcb7c7',
        'full_name': 'update',
        'field_expertise': 'cats',
        'city': 'new city',
        'country': 'new country',
        'public_profile': 'true',
        'profile_type': 'Institution',
        'biography': 'updated biography',
        'website': 'updated website',
        'social_media': ['new facebook'],
        'affiliation': 'updated affiliation',
        'position': 'updated position',
        'contact_person': 'updated contact person',
        'contact_email': 'updated email'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({ body, 'path': '/admin/profiles/update' } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual({'success': true});
  });
  test('Get a bad response when no id is given', async () => {
    const
      requestBody = { 'id': '' },
      body: string = JSON.stringify(requestBody),
      response = await update({ body } as APIGatewayProxyEvent);
    expect(response.statusCode).toEqual(400);
  });
});
