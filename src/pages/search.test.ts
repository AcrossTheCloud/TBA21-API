require('dotenv').config(
  {
    DEBUG: true
  });

import { MultiQueryStringParameters, QueryStringParameters } from '../types/_test_';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';
import { get } from './search';

describe('search tests', () => {

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});
test('Get items from search function', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '5'},
      multiValueQueryStringParameters: MultiQueryStringParameters = {searchQuery: ['a']},
      response = await get({ multiValueQueryStringParameters, queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    console.log(results);
    expect(results.items.length).toEqual(6);
    expect(results.collections.length).toEqual(3);
  });
});