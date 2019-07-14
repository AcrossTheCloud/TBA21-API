require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { updateById } from './update';

describe('/admin/collections/update/updateByID', () => {

  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Update ID 1', async () => {
    const
      requestBody = {
        "id": "1",
        "cast_": "test",
        "items": ['private/user/key1','private/user/key2','private/user/key3'],
        "place": "Ocean"
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
      console.log(response);

    expect(responseBody).toBe(true);
  });

  test('Check that supplying just the id returns a 400', async () => {
    const
      requestBody = { "id": "1" },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.message).toEqual('Nothing to update');
  });

  test('Get a bad response when no id is given', async () => {
    const
      requestBody = { "id": "" },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent);

    expect(response.statusCode).toEqual(400);
  });
});
