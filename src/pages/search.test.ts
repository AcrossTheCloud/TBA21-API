require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';
import { post } from './search';

describe('search tests', () => {

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});
test('limit the items we get from search function', async () => {
    const
      requestBody = {limit: '1', criteria: [{field : 'subtitle', value: 'subtitle'}]},
      body: string = JSON.stringify(requestBody),
      response = await post({ body } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.results.length).toEqual(2);
  });
test('Get items from search function with multiple criteria', async () => {
    const
      requestBody = {limit: '5', criteria: [{field : 'subtitle', value: 'subtitle'}, {field : 'title', value: 'Detonation'}]},
      body: string = JSON.stringify(requestBody),
      response = await post({ body } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.results.length).toEqual(5);
  });
test('Get items from search function with multiple criteria and focus', async () => {
    const
      requestBody = {limit: '10', focus_arts: 'true', criteria: [{field : 'title', value: 'Detonation'}]},
      body: string = JSON.stringify(requestBody),
      response = await post({ body } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.results.length).toEqual(1);
  });
});
