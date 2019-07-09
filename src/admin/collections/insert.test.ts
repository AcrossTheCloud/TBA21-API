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
        "cast_": "test1",
        "place": "Ocean"
      },
      body: string = JSON.stringify(requestBody),
      response = await createCollection({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
  });

  test('Create a collection with items', async () => {
    const
      requestBody = {
        "cast_": "test",
        "items": ['private/user/key1','private/user/key2','private/user/key3'],
        "place": "Ocean"
      },
      body: string = JSON.stringify(requestBody),
      response = await createCollection({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
      let nItems= await db.one(`select count(1) from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`,[responseBody.id]);

    expect(nItems.count).toBe('3');
  });


});
