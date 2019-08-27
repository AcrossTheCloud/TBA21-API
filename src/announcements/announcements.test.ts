require('dotenv').config(
  {
    DEBUG: true
  }
);

import { QueryStringParameters } from '../types/_test_';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { get } from './announcements';

test('Get an announcement by its id', async () => {
  const
    queryStringParameters: QueryStringParameters = {id: '1'},
    response = await get({queryStringParameters } as APIGatewayProxyEvent),
    results = JSON.parse(response.body);
  expect(results.announcement.id).toEqual('1');
});