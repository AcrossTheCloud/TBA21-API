require('dotenv').config(
  {
    DEBUG: true
  }
);

import { QueryStringParameters } from '../types/_test_';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { get } from './announcements';
import { db } from '../databaseConnect';
import { reSeedDatabase } from '../utils/testHelper';

// AfterAll tests reseed the DB
afterAll( async () => {
  await reSeedDatabase();
  // Close the database connection.
  db.$pool.end();
});
describe('src/announcements', () => {
  test('Get an announcement by its id', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await get({queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.announcements[0].id).toEqual('1');
  });
  test('Get all announcement', async () => {
    const
      queryStringParameters: QueryStringParameters = {},
      response = await get({queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.announcements.length).toEqual(2);
  });
});
