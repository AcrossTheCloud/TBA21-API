require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { deleteById } from './delete';
import { reSeedDatabase } from '../../utils/testHelper';

describe('Admin Collections Delete', () => {
  afterAll(async () => {
    await reSeedDatabase();
    db.$pool.end();
  });

  test('Contributor tries to delete collection ID 1, not belonging to them', async () => {
    const
      queryStringParameters: QueryStringParameters = { id: '1' },
      response = await deleteById({
        queryStringParameters, path: '/contributor/collections/delete', requestContext: {
          identity: {
            cognitoAuthenticationProvider: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:1f89f9b6-39bc-416e-899e-ef1a8d656f24"
          }
        }
      } as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(403);
  });

  test('Admin deletes ID 1', async () => {
    const
      queryStringParameters: QueryStringParameters = { id: '1' },
      response = await deleteById({ queryStringParameters, path: '/admin/collections/delete' } as APIGatewayProxyEvent),
      body = JSON.parse(response.body);

    expect(body).toBe(true);
  });

  test('Contributor tries to delete ID 2, belonging to them', async () => {
    const
      queryStringParameters: QueryStringParameters = { id: '2' },
      response = await deleteById({
        queryStringParameters, path: '/contributor/collections/delete', requestContext: {
          identity: {
            cognitoAuthenticationProvider: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:7e32b7c6-c6d3-4e70-a101-12af2df21a19"
          }
        }
      } as APIGatewayProxyEvent),
      body = JSON.parse(response.body);

    expect(body).toBe(true);
  });



  test('Get a bad response when no id is given', async () => {
    const
      queryStringParameters: QueryStringParameters = { id: '' },
      response = await deleteById({ queryStringParameters } as APIGatewayProxyEvent);

    expect(response.statusCode).toEqual(400);
  });
});
