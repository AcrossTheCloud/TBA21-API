require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import {
  get
} from './tags';

describe('Tag tests', () => {
  afterAll(() => {
    // Close the database connection.
    db.$pool.end();
  });

  test('Check that we have 3 keyword tags with the name of keyword.', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'keyword', query: 'keyword'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(3);
  });

  test('Check that we have 0 keyword tags by the name of QQQ', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'keyword', query: 'QQQ'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(0);
  });

  test('Check that we have 3 concept tags with the name of concept.', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'concept', query: 'concept'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(3);
  });
  test('Check that we have 0 concept tags by the name of QQQ', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'concept', query: 'QQQ'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(0);
  });

  test('400 when no queryStrings passed', async () => {
    const { statusCode } = await get({ } as APIGatewayProxyEvent);
    expect(statusCode).toEqual(400);
  });
});
