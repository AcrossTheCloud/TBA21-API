require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { deleteById } from './delete';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('/admin/collections/delete/deleteByID', () => {
  test('Delete ID 1', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await deleteById({ queryStringParameters } as APIGatewayProxyEvent),
      body = JSON.parse(response.body);

    expect(body).toBe(true);
  });

  test('Get a bad response when no id is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: ''},
      response = await deleteById({queryStringParameters } as APIGatewayProxyEvent);

    expect(response.statusCode).toEqual(400);
  });
});
