require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import {
  get,
  getById,
  getByPerson,
  getByTag,
  changeStatus,
  getCollectionsInBounds,
  getItemsInCollection,
  getCollectionsByItem
} from './collections';

describe('Collections', () => {

  afterAll( () => {
    // Close the database connection.
    db.$pool.end();
  });

  test('The function runs without queryStringParams', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.collections.length).toEqual(3);
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.collections.length).toEqual(1);
  });

  test('Pagination works', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '1', offset: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.collections.length).toEqual(1);
    expect(result.collections[0].title).toEqual('The Decisive Moment');
  });

  test('Get collection by id of 2', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getById({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.collection.id).toEqual('2');
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

    expect(result.collections.length).toEqual(3);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });

  test('Get all collections with a person of Tim', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: 'Tim'},
      response = await getByPerson({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.collections.length).toEqual(2);
  });
  test('Get a bad response when no person is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: ''},
      response = await getByPerson({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });

  test('Get a bad response when no id is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {status: 'false', id: ''},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Get a bad response when no status is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {status: '', id: '1'},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });

  test('Get all items within the bounding box (90, 180, 90, 180)', async () => {
    const
      queryStringParameters: QueryStringParameters = {lat_sw: '-90', lng_sw: '-180', lat_ne: '90', lng_ne: '180'},
      response = await getCollectionsInBounds({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.collections.length).toEqual(3);
  });
  test
  ('Get a bad response when a boundary is missing', async () => {
    const
      queryStringParameters: QueryStringParameters = {lat_sw: '-90', lng_sw: '', lat_ne: '90', lng_ne: '180'},
      response = await getCollectionsInBounds({queryStringParameters } as APIGatewayProxyEvent, {} as Context);
    expect(response.statusCode).toEqual(400);
  });

  test('Check function doesnt return an item where the status is false', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getItemsInCollection({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);
    expect(item.items.length).toEqual(1);
  });

  test('Get all the collections an item belongs to', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg'},
      response = await getCollectionsByItem({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.collections.length).toEqual(2);
  });
});
