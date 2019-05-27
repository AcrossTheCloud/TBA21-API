require('dotenv').config(
  {
    DEBUG: true,
    path: process.cwd() + '/.env-test'
  }
);

import { APIGatewayEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { getItems } from './items';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('This is a simple test', () => {
  test('Check the get function', async () =>{
    const
      response = await getItems({} as APIGatewayEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message[0].id).toEqual('1');
    expect(item.message[0].series).toEqual('series');

  });
});
