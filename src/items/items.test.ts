require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import {
  get,
  getBys3Key,
  getByTag,
  getByPerson,
  getByType,
  changeStatus,
  getItemsInBounds,
  deleteItem,
  deleteItemsFromCollection
} from './items';
afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('get Tests', () => {

  test('Check that we have 5 seeds with a status of true.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(5);
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(2);
  });
});

describe('/items/getBys3Key', () => {
  test('Get item by its s3 key', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/user/key2'},
      response = await getBys3Key({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.s3_key).toEqual('private/user/key2');
  });
  test(`Check an item with a status of false isn't returned`, async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/user/key1'},
      response = await getBys3Key({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    console.log('empt ', results.items);

    expect(results.items).toEqual(null);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/getByTag', () => {
  test('Get all items with a tag of con', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'con'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(2);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/getByPerson', () => {
  test('Get all items with person Tim attached', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: 'Tim'},
      response = await getByPerson({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(2);
  });
  test('Get a bad response when no people are given', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: ''},
      response = await getByPerson({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/getByType', () => {
  test('Get all items with a type of b', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'b'},
      response = await getByType({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(1);
  });
  test('Get a bad response when no type is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/changeStatus', () => {
  test('Change the status of an item', async () => {
    let
      queryStringParameters: QueryStringParameters = {status: 'true', s3Key: 'private/user/key3'},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    expect(results);
    response = await get({} as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(5);
  });
  test('Get a bad response when no id is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {status: 'false', s3Key: ''},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Get a bad response when no status is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {status: '', s3Key: 'private/user/key2'},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/getItemsInBounds', () => {
  test('Get all items within the bounding box (32.784840, 32.781431, 11.201, -0.009226)', async () => {
    const
      queryStringParameters: QueryStringParameters = {lat_sw: '28.620240545725636', lng_sw: '-25.116634368896488', lat_ne: '52.62108005994499', lng_ne: '38.16461563110352'},
      response = await getItemsInBounds({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(2);
  });
  test('Get a bad response when a boundary is missing', async () => {
    const
      queryStringParameters: QueryStringParameters = {lat_sw: '28.620240545725636', lng_sw: '', lat_ne: '52.62108005994499', lng_ne: '38.16461563110352'},
      response = await getItemsInBounds({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
});

describe('/items/deleteItem', () => {
  test('Delete an item with an key of key4', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3_key: 'key4'},
      response = await deleteItem({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    expect(results).toBe(true);
  });
});

describe('/items/deleteItemsFromCollection', () => {
  test('Delete an item from a collection with an key of key6', async () => {
    const
      requestBody = {
      'id': '1',
      's3_keys': ['user/key6']
      },
      body: string = JSON.stringify(requestBody),
      response = await deleteItemsFromCollection({ body } as APIGatewayProxyEvent, {} as Context),
      responseBody = JSON.parse(response.body);

    expect(responseBody).toBe(true);
  });
});