require('dotenv').config(
  {
    DEBUG: true
  }
);

import { QueryStringParameters } from '../types/_test_';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';
import { reSeedDatabase } from '../utils/testHelper';
import { get } from './shortPaths';

describe('shortPaths/shortpaths/get', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('get for short paths by id', async () => {
    const
      queryStringParameters: QueryStringParameters = {
        'table': 'Profile',
        'id': '2'
      },
      response = await get({queryStringParameters} as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.short_path);
  });
  test('get for short paths by short path', async () => {
    const
      queryStringParameters: QueryStringParameters = {
        'table': 'Item',
        'short_path': 'Kitten'
      },
      response = await get({queryStringParameters} as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.short_path);
  });
  test('Check nothing is returned when no column and no params is passed', async () => {
    const
      queryStringParameters: QueryStringParameters = {
        'table': 'Item'
      },
      response = await get({queryStringParameters} as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.message).toEqual('Bad request, invalid query parameter.');
  });
});
