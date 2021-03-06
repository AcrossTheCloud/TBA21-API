require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import { reSeedDatabase } from '../utils/testHelper';
import { get } from './tags';

afterAll(async () => {
  await reSeedDatabase();
  // Close the database connection.
  db.$pool.end();
});

describe('Tag get tests', () => {
  test('Check that we have 10 keyword tags with the name of kitten.', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'keyword'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(10);
  });

});

describe('Tag get tests', () => {
  test('Check that we have 3 keyword tags with the name of kitten.', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'keyword', query: 'kitten'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(1);
  });

  test('Check that we have 0 keyword tags by the name of QQQ', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'keyword', query: 'QQQ' },
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(0);
  });

  test('Check that we have 1 concept tags with the name of Labor.', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'concept', query: 'Labor' },
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(1);
  });
  test('Check that we have 0 concept tags by the name of QQQ', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'concept', query: 'QQQ' },
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(0);
  });

  test('400 when no queryStrings passed', async () => {
    const { statusCode } = await get({} as APIGatewayProxyEvent);
    expect(statusCode).toEqual(400);
  });
});
