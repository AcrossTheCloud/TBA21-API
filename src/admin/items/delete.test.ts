require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { reSeedDatabase } from '../../utils/testHelper';
import {
  deleteItem,
  deleteItemsFromCollection
} from './delete';

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

  test('Delete an item from a collection with an key of key6', async () => {
    const
      requestBody = {
        'id': '1',
        's3_keys': ['user/key6']
      },
      body: string = JSON.stringify(requestBody),
      response = await deleteItemsFromCollection({ body } as APIGatewayProxyEvent, {} as Context),
      responseBody = JSON.parse(response.body);

    expect(responseBody).toBe(true);
  });

});
