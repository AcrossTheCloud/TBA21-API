require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { get, insert } from './profiles';
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
      profile = JSON.parse(response.body);
    expect(profile);
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
});