require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import { reSeedDatabase } from '../utils/testHelper';
import {
  get,
  search,
  insert,
  update,
  remove
} from './tags';

afterAll(async () => {
  await reSeedDatabase();
  // Close the database connection.
  db.$pool.end();
});

describe('Tag get tests', () => {
  test('Check that we have 9 keyword tags with the name of kitten.', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'keyword'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(9);
  });

  test('Check that we have 1 keyword tag using limit with the name of keyword.', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'keyword', limit: '1' },
      response = await get({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(1);
  });

});

describe('Tag search tests', () => {
  test('Check that we have 3 keyword tags with the name of kitten.', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'keyword', query: 'kitten'},
      response = await search({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(1);
  });

  test('Check that we have 0 keyword tags by the name of QQQ', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'keyword', query: 'QQQ' },
      response = await search({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(0);
  });

  test('Check that we have 1 concept tags with the name of Labor.', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'concept', query: 'Labor' },
      response = await search({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(1);
  });
  test('Check that we have 0 concept tags by the name of QQQ', async () => {
    const
      queryStringParameters: QueryStringParameters = { type: 'concept', query: 'QQQ' },
      response = await search({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(results.tags.length).toEqual(0);
  });

  test('400 when no queryStrings passed', async () => {
    const { statusCode } = await get({} as APIGatewayProxyEvent);
    expect(statusCode).toEqual(400);
  });
});

describe('Tag insert tests', () => {
  test('Insert 1 keyword tag and check the result', async () => {
    const
      requestBody = {
        'type': 'keyword',
        'tags': ['Espeon']
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.tags.length).toEqual(1);
    expect(responseBody.tags[0]).toMatchObject({ 'id': '10', 'tag_name': 'Espeon' });
  });

  test('Insert 1 keyword that doesn\'t exist tag and check the results', async () => {
    const
      requestBody = {
        'type': 'keyword',
        'tags': ['Pikachu', 'Eevee']
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.tags.length).toEqual(2);
    expect(responseBody.tags).toEqual(expect.arrayContaining([{ 'id': '11', 'tag_name': 'Pikachu'}, {'id': '12', 'tag_name': 'Eevee' }]));
  });
});

describe('Tag update and delete tests', () => {
  test('Update 1 keyword tag and check the result', async () => {
    const
      requestBody = {
        'type': 'keyword',
        'id': 1,
        'new_tag_name': 'changed keyword tag'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.updatedTag.tag_name).toEqual('changed keyword tag');
    expect(responseBody.updatedTag.id).toEqual('1');

  });

  test('Delete 1 concept tag and check the result', async () => {
    const
      requestBody = {
        'type': 'concept',
        'id': 1
      },
      body: string = JSON.stringify(requestBody),
      response = await remove({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody).toEqual(true);

  });
});
