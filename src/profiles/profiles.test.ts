require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { requestContext } from '../types/_test_';
import { update } from './profiles';
import { db } from '../databaseConnect';
import { reSeedDatabase } from '../utils/testHelper';

describe('Profile get tests', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Test a user can update their own profile', async () => {
    const
      requestBody = {
        'full_name': 'Danny Boi'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({body, requestContext} as unknown as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual(true);
  });

  test('Accept License', async () => {
    const
      requestBody = {
        'accepted_license': true
      },
      body: string = JSON.stringify(requestBody),
      response = await update({body, requestContext} as unknown as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody).toEqual(true);
  });
});
