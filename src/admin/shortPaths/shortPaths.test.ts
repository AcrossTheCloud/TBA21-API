require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { reSeedDatabase } from '../../utils/testHelper';
import { db } from '../../databaseConnect';
import { insert } from './shortPaths';

describe('admin/shortpaths/insert', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('insert for short paths', async () => {
  const
    requestBody = {
      'short_path': 'new',
      'id': '6',
      'object_type': 'Profile',
      'created_at': '2019-02-22 10:53',
    },
    body: string = JSON.stringify(requestBody),
    response = await insert({ body } as APIGatewayProxyEvent),
    responseBody = JSON.parse(response.body);
  console.log(responseBody);
  expect(responseBody.short_path).toEqual('new');
  });
});
