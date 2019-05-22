import { APIGatewayEvent, Context } from 'aws-lambda';
import { get } from './items';

describe('This is a simple test', () => {
  test('Check the get function', () => {
    get({} as APIGatewayEvent, {} as Context, (error, response) => {
      const json = JSON.parse(response.body);
      expect(json.message).toEqual('stuff');
    });
  });
});
