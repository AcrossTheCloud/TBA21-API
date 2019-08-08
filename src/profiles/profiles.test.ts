require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { get, insert, search, update } from './profiles';
import { QueryStringParameters } from '../types/_test_';
import { db } from '../databaseConnect';
import { reSeedDatabase } from '../utils/testHelper';

describe('Profile get tests', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Check that we have a profile', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.profile);
  });
  test('Check that we have a profile with the full_name starting with r', async () => {
    const
      queryStringParameters: QueryStringParameters = {query: 'r'},
      response = await search({ queryStringParameters } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.profile);
  });
  test('Check that we have a private profile isnt returned', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.profile).toEqual([]);
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
        'profile_type': 'Collective'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody).toBe(true);
  });
  test('update a profile completely', async () => {
    const
      requestBody = {
        'id': '3',
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
      response = await update({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody).toBe(true);
  });
  test('Get a bad response when no id is given', async () => {
    const
      requestBody = { 'id': '' },
      body: string = JSON.stringify(requestBody),
      response = await update({ body } as APIGatewayProxyEvent);

    expect(response.statusCode).toEqual(400);
  });
});