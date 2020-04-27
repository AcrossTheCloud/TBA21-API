require('dotenv').config(
  {
    DEBUG: true
  });

import { QueryStringParameters } from '../types/_test_';
import { get } from './homepage';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';

describe('homepage tests', () => {

  afterAll( () => {
    // Close the database connection.
    db.$pool.end();
  });

  test('Get non oa_highlight items and collections between dates', async () => {
    const
      queryStringParameters: QueryStringParameters = {date: '2011-07-01',  oa_highlight: 'false'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(3);
    expect(results.collections.length).toEqual(2);
  });
  test('Get oa_highlights', async () => {
    const
    queryStringParameters: QueryStringParameters = {oa_highlight: 'true'},
    response = await get({ queryStringParameters } as APIGatewayProxyEvent),
    results = JSON.parse(response.body);
  expect(results.oa_highlight_items.length).toEqual(1);
  expect(results.oa_highlight_collections.length).toEqual(1);
  });
  test('Test we can limit what we get back', async () => {
    const
      queryStringParameters: QueryStringParameters = {date: '2011-07-01', itemsLimit: '1', oa_highlight: 'false'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(1);
    expect(results.collections.length).toEqual(2);
  });
});
