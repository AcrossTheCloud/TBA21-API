require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get, getItem, getByTag, getByType, getAllMine } from './items';

describe('Admin Items', () => {
  afterAll( () => {
    // Close the database connection.
    db.$pool.end();
  });

  test('Check that we have 6 seeds.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(6);
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(2);
  });

  test('Search for Chris in creators and expect 3 results', async () => {
    const
      queryStringParameters: QueryStringParameters = {inputQuery: 'Chris'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(3);
  });
  test('Search for justice in tags and expect 5 results', async () => {
    const
      queryStringParameters: QueryStringParameters = {inputQuery: 'justice'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(5);
  });
  test('Search for ben in creators and expect 2 results', async () => {
    const
      queryStringParameters: QueryStringParameters = {inputQuery: 'ben'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.items.length).toEqual(2);
  });
  test('Search for ocean in creators and expect 5 results', async () => {
    const
      queryStringParameters: QueryStringParameters = {inputQuery: 'ocean'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.items.length).toEqual(5);
  });
  test('Get item with a specific s3 key', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg'},
      response = await getItem({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.item.s3_key).toEqual('private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg');
  });
  test('Get item by its id', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await getItem({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.item.id).toEqual('1');
  });
  test('Get a bad response when no key is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Get all items with a tag of kitten', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'kitten'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(1);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Get items by their type', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'Video'},
      response = await getByType({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(5);
  });
  test('Get items by their person', async () => {
    const
      queryStringParameters: QueryStringParameters = {},
      response = await getAllMine({ queryStringParameters, path: '/contributor/items/getByPerson', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.items.length).toEqual(2);
  });

  test('Contributor get item by id', async () => {
    const
      queryStringParameters: QueryStringParameters = { id: '2'},
      response = await getItem({ queryStringParameters, path: '/contributor/items/getItem', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.item.id).toEqual("2");
  });
});
