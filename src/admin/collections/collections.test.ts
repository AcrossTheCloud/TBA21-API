require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get, getById, getByTag } from './collections';

describe('Admin Collections', () => {

  afterAll( () => {
    // Close the database connection.
    db.$pool.end();
  });

  test('The function runs without queryStringParams', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(4);
  });

  test('Check we have a COUNT of 4 with status of true', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections[0].count).toEqual('4');
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(1);
  });

  test('Pagination works', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '1', offset: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(1);
    expect(item.collections[0].title).toEqual('Detonation');
  });

  test('Get collection by id of 2', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getById({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.id).toEqual('2');
  });

  test('Get a bad response when no id is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });

  test('Get all collections with a tag of con', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'con'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(2);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});
