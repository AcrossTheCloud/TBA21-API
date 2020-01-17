require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get, getById, getByPerson, getByTag, getCollectionsInCollection, getItemsInCollection } from './collections';

describe('Admin Collections', () => {

  afterAll( () => {
    // Close the database connection.
    db.$pool.end();
  });

  test('Check we have a COUNT of 3 with status of true', async () => {
    const
      response = await get( {queryStringParameters: {}, path: '/admin/collections/get'} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries[0].properties.count).toEqual('3');
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '1'},
      response = await get({ queryStringParameters, path: '/admin/collections/get' } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries.length).toEqual(1);
  });

  test('Pagination works', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '1', offset: '1'},
      response = await get({ queryStringParameters, path: '/admin/collections/get' } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries.length).toEqual(1);
    expect(result.data.objects.output.geometries[0].properties.title).toEqual('The Decisive Moment');
  });

  test('Get collection by id of 2', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getById({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries[0].properties.id).toEqual('2');
  });

  test('Get a bad response when no id is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });

  test('Get all collections with a tag of justice', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'justice'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries.length).toEqual(3);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Get collection by person', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: 'tim'},
      response = await getByPerson({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.data.objects.output.geometries.length).toEqual(2);
  });
  test('Get items in a collection', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '3'},
      response = await getItemsInCollection({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.data.objects.output.geometries.length).toEqual(2);
  });
  test('Get items in a collection with only returning limited results', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '3'},
      response = await getItemsInCollection({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.data.objects.output.geometries[0].properties.title).toEqual('Detonation');
  });

  test('Get collections in a collection', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await getCollectionsInCollection({queryStringParameters } as APIGatewayProxyEvent),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries.length).toEqual(2);
  });

  test('Get a contributors collection', async () => {
    const
      response = await get( {queryStringParameters: {}, path: '/contributor/collections/get', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:7e32b7c6-c6d3-4e70-a101-12af2df21a19'
          }
        }
      } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries[0].properties.count).toEqual('3');
  });

  test('Get a contributors collection by id', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await get( {queryStringParameters, path: '/contributor/collections/get', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }
      } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.data.objects.output.geometries[0].properties.count).toEqual('1');
    expect(result.data.objects.output.geometries[0].properties.id).toEqual('1');
  });

});
