require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { createCollection } from './insert';

describe('/admin/collections/insert/', () => {

  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Create an empty collection without items', async () => {
    const
      requestBody = {
        'cast_': 'test1',
        'place': 'Ocean'
      },
      body: string = JSON.stringify(requestBody),
      response = await createCollection({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.success).toBe(true);
  });

  test('Create a collection with items', async () => {
    const
      requestBody = {
        'cast_': 'test',
        'items': ['private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/862f0b10-a6a7-11e9-9669-7fbab4073699-Humpback_Whales_-_South_Bank.jpg', 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg'],
        'place': 'Ocean'
      },
      body: string = JSON.stringify(requestBody),
      response = await createCollection({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body),
      nItems = await db.one(`select count(1) from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`, [responseBody.id ]);
    expect(nItems.count).toBe('2');
  });
});
