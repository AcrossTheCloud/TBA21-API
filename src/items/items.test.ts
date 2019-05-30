require('dotenv').config(
  {
    DEBUG: true,
    path: process.cwd() + (process.env.LOCAL ? '/.env' : '/.env-test')
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import { get, getById, getByTag } from './items';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('get Tests', () => {

  test('Check that we have 8 seeds.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message.length).toEqual(8);
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message.length).toEqual(2);
  });

  test('Check that the first row is populated and has specific values.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message[0].id).toEqual('1');
    expect(item.message[0].place).toEqual('place');
  });

  test('Check that the second row is populated and has specific values.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message[1].id).toEqual('2');
    expect(item.message[1].s3_key).toEqual('my-test-path/my-test-file.txt');
  });
});

describe('/items/getById', () => {
  test('Get item by id of 2', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getById({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message[0].id).toEqual('2');
  });
});

describe('/items/getByTag', () => {
  test('Get all items with a tag of 1', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'con'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message.length).toEqual(6);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});
