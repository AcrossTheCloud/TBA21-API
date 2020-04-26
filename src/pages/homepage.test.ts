require('dotenv').config(
  {
    DEBUG: true
  });

import { MultiQueryStringParameters, QueryStringParameters } from '../types/_test_';
import { get } from './homepage';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';

describe('homepage tests', () => {

  afterAll( () => {
    // Close the database connection.
    db.$pool.end();
  });

  test('Get items and collections between dates', async () => {
    const
      queryStringParameters: QueryStringParameters = {date: '2011-07-01',  oa_highlight: 'false'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(4);
    expect(results.collections.length).toEqual(3);
  });
  test('Test we can limit what we get back', async () => {
    const
      queryStringParameters: QueryStringParameters = {date: '2011-07-01', itemsLimit: '1', oa_highlight: 'false'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(1);
    expect(results.collections.length).toEqual(3);
  });
});
