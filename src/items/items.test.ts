require('dotenv').config({ DEBUG: true });

import { APIGatewayEvent, Context } from 'aws-lambda';
import { getItems } from './items';

describe('This is a simple test', () => {
  test('Check the get function', async () =>{
    const
      response = await getItems({} as APIGatewayEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.message[0].id).toEqual('3');

  });
});
