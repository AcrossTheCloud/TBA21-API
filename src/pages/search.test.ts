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
test('limit the items we get from search function', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '5'},
      multiValueQueryStringParameters: MultiQueryStringParameters = {searchQuery: ['a']},
      response = await get({ multiValueQueryStringParameters, queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(5);
    expect(results.collections.length).toEqual(2);
  });
test('Get items from search function with multiple searchQueries', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '10'},
      multiValueQueryStringParameters: MultiQueryStringParameters = {searchQuery: ['a', 'b']},
      response = await get({ multiValueQueryStringParameters, queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(5);
    expect(results.collections.length).toEqual(2);
  });
test('Get items from search function with multiple searchQueries and focus', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '10', focus_arts: 'true', focus_scitech: 'true'},
      multiValueQueryStringParameters: MultiQueryStringParameters = {searchQuery: ['a', 'b']},
      response = await get({ multiValueQueryStringParameters, queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(6);
    expect(results.collections.length).toEqual(2);
  });
});