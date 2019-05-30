require('dotenv').config(
  {
    DEBUG: true,
    path: process.cwd() + (process.env.LOCAL ? '/.env' : '/.env-test')
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get } from './collections';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('/admin/collections/collections.get', () => {

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

  /*
    SELECT
      collection.*
    FROM tba21.collections AS collection
    GROUP BY collection.ID
    LIMIT 1 OFFSET 3
  */
  test('Pagination works', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '1', offset: '3'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(1);
    expect(item.collections[0].title).toEqual('Quantum Aspects of Life');
  });

});
