import { QueryStringParameters } from '../../types/_test_';

require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { getById, getByShortPath, insert } from './shortPaths';

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
        'short_path': 'kitten'
      },
      response = await getByShortPath({queryStringParameters} as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.short_path);
  });
  test('get for short paths by id', async () => {
    const
      queryStringParameters: QueryStringParameters = {
        'table': 'Item',
        'id': '1'
      },
      response = await getById({queryStringParameters} as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.short_path);
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
