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
        'id': '1',
        'cast_': 'test',
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg'],
        'place': 'Ocean'
      },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody).toBe(true);
  });

  test('Check that supplying just the id returns a 400', async () => {
    const
      requestBody = { 'id': '1' },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.message).toEqual('Nothing to update');
  });

  test('Get a bad response when no id is given', async () => {
    const
      requestBody = { 'id': '' },
      body: string = JSON.stringify(requestBody),
      response = await updateById({ body } as APIGatewayProxyEvent);

    expect(response.statusCode).toEqual(400);
  });
});
