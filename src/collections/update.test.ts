require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import { reSeedDatabase } from '../utils/testHelper';
import { get, changeStatus } from './collections';

describe('Collections Update', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  afterEach( async () => {
    await reSeedDatabase();
  });

  test('Change the status of a collection', async () => {
    const
      queryStringParameters: QueryStringParameters = {status: 'false', id: '1'},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results);
    const getResponse = await get({} as APIGatewayProxyEvent, {} as Context),
      getResults = JSON.parse(getResponse.body);

    expect(getResults.collections.length).toEqual(2);
  });

});
