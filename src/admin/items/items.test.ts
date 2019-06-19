require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get, getBys3Key, getByTag } from './items';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('get Admin Tests', () => {

  test('Check that we have 7 seeds.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(7);
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(2);
  });
});

describe('admin/items/getBys3Key', () => {
  test('Get item with a specific s3 key', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/user/key2'},
      response = await getBys3Key({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    console.log(result.items);
    expect(result.items.s3_key).toEqual('private/user/key2');
  });
  test('Get a bad response when no key is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('admin/items/getByTag', () => {
  test('Get all items with a tag of con', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'con'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(4);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});
