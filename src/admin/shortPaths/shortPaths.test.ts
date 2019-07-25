import { QueryStringParameters } from '../../types/_test_';

require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { get, insert } from './shortPaths';

describe('admin/shortPaths/shortpaths/get', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('get for short paths', async () => {
    const
      queryStringParameters: QueryStringParameters = {
        'table': 'Item',
        'short_path': 'Kitten'
      },
      response = await get({queryStringParameters} as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody);
  });
  test('insert for short paths', async () => {
    const
      requestBody = {
        'short_path': 'new',
        'id': '6',
        'object_type': 'Profile'
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.short_path).toEqual({'short_path': 'new'});
  });
});
