require('dotenv').config({ DEBUG: true });

import { APIGatewayEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { getItems, getItemsById } from './items';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('This is a simple test', () => {
  test('Check the get function', async () => {
    const
      response = await getItems({} as APIGatewayEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message[0].id).toEqual('8');

  });
  test('testing the getItemsById function', async () => {
    const
        response = await getItemsById(8, {} as APIGatewayEvent, {} as Context,  ),
        item = JSON.parse(response.body);

    expect(item.message[0].id).toEqual('8');
  });
});
