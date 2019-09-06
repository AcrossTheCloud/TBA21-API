
require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { reSeedDatabase } from '../../utils/testHelper';
import { deleteItem } from './delete';
import { get } from '../../shortPaths/shortPaths';

describe('Items Delete', () => {
  // AfterAll tests reseed the DB
  afterAll(async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Delete an item with an id of 2 then check the short path was deleted', async () => {
    let
      queryStringParameters: QueryStringParameters = { s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-cat-pet-animal-domestic-104827.jpeg' },
      response = await deleteItem({ queryStringParameters, path: '/admin/items/delete' } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    console.log(results);
    expect(results).toBe(true);

    queryStringParameters = {
      table: 'Item',
      id: '3'
    },
      response = await get({ queryStringParameters } as APIGatewayProxyEvent);
    results = JSON.parse(response.body);
    expect(results.short_paths).toEqual([]);
  });

  test('Contributor tries to delete item with an id of 1, not belonging to them', async () => {
    const
      queryStringParameters: QueryStringParameters = { s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad749e30-a6a0-11e9-b5d9-1726307e8330-photo-1518791841217-8f162f1e1131.jpeg' },
      response = await deleteItem({
        queryStringParameters, path: '/contributor/collections/delete', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }
      } as APIGatewayProxyEvent,  {} as Context);

    expect(response.statusCode).toBe(403);
  });

  test('ContDelete tries to delete item with an id of 1, belonging to them ', async () => {
    const
      queryStringParameters: QueryStringParameters = { s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad749e30-a6a0-11e9-b5d9-1726307e8330-photo-1518791841217-8f162f1e1131.jpeg' },
      response = await deleteItem({
        queryStringParameters, path: '/contributor/collections/delete', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:1f89f9b6-39bc-416e-899e-ef1a8d656f24'
          }
        }
      } as APIGatewayProxyEvent,  {} as Context),
      body = JSON.parse(response.body);

    expect(body).toBe(true);
  });

});
