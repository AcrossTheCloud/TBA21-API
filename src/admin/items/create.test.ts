require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { createItem } from './create';

describe('/contributor/item/create', () => {

  // AfterAll tests reseed the DB
  afterAll(async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('create VideoEmbed item', async () => {
    const
      requestBody = {
        url: 'https://www.youtube.com/watch?v=9gxEfjtgqlA'
      },
      body: string = JSON.stringify(requestBody),
      response = await createItem({
        body, path: '/contributor/items/create', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }
      } as APIGatewayProxyEvent);
    console.log(response);
    expect(response.statusCode).toBe(200);
  });

  // Contributors tests:

  test('create VideoEmbed item with bad url', async () => {
    const
      requestBody = {
        'url': 'badurl',
      },
      body: string = JSON.stringify(requestBody),
      response = await createItem({
        body, path: '/contributor/items/create', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }
      } as APIGatewayProxyEvent);
    expect(response.statusCode).toBe(400);
  });

  

});
