
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

  test('Delete an item with an id of 2 then check the short path was deleted', async () => {
    let
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await deleteItem({queryStringParameters , path:'/admin/items/delete' } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    expect(results).toBe(true);
    
    queryStringParameters = {
        table: 'Item',
        id: '2'
      },
      response = await get({queryStringParameters} as APIGatewayProxyEvent);
    results = JSON.parse(response.body);
    expect(results.short_paths).toEqual([]);
  });
});
