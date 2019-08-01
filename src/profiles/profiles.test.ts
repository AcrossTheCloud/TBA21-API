import { QueryStringParameters } from '../types/_test_';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { get, insert } from './profiles';
import { reSeedDatabase } from '../utils/testHelper';
import { db } from '../databaseConnect';

describe('Profile get tests', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Check that we have 1 profile with an id of 1.', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    console.log(response, results, queryStringParameters);
    expect(results.profile.id).toEqual(1);
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
    console.log(responseBody, response);
    expect(responseBody.success).toBe(true);
});
});