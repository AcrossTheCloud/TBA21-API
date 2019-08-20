require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { reSeedDatabase } from '../../utils/testHelper';
import { deleteItem } from './delete';
import { get } from '../../shortPaths/shortPaths';

describe('Items Delete', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Delete an item with an key of key4', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3_key: 'key4'},
      response = await deleteItem({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    expect(results).toBe(true);
  });
});
