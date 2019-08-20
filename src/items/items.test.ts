require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import {
  get,
  getItem,
  getByTag,
  getByPerson,
  getByType,
  changeStatus,
  getItemsInBounds,
  getRekognitionTags,
  homepage,
} from './items';

describe('Item tests', () => {
  afterAll( () => {
    // Close the database connection.
    db.$pool.end();
  });

  test('Check that we have 3 seeds with a status of true.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(3);
  });

  test('Check that we can limit the number of returned items.', async () => {
    const
      queryStringParameters: QueryStringParameters = {limit: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(2);
  });
  test('Get item by its s3 key', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg'},
      response = await getItem({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.item.s3_key).toEqual('private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-kitten-pet-animal-domestic-104827.jpeg');
  });
  test(`Check an item with a status of false isn't returned`, async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg'},
      response = await getItem({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.item).toEqual(null);
  });
  test('Get item by its id', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getItem({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.item.id).toEqual('2');
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Get all items with a tag of kitten', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: 'kitten'},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(1);
  });
  test('Get a bad response when no tag is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {tag: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Get all items with person Maddie attached', async () => {
    const
      queryStringParameters: QueryStringParameters = {person: 'Maddie'},
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
  test('Get all items with a type of video', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: 'Video'},
      response = await getByType({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(2);
  });
  test('Get a bad response when no type is given', async () => {
    const
      queryStringParameters: QueryStringParameters = {type: ''},
      response = await getByTag({queryStringParameters } as APIGatewayProxyEvent, {} as Context);

    expect(response.statusCode).toEqual(400);
  });
  test('Change the status of an item', async () => {
    let
      queryStringParameters: QueryStringParameters = {status: 'true', s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg'},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results);

    response = await get({} as APIGatewayProxyEvent, {} as Context);
    results = JSON.parse(response.body);

    expect(results.items.length).toEqual(4);
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

  test('Get Rekognition Tags from item default confidence', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg'},
      response = await getRekognitionTags({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(response.statusCode).toEqual(200);
    expect(results.tags).toEqual([ 'Manx', 'Cat', 'Mammal', 'Pet', 'Animal', 'Abyssinian', 'Kitten' ]);
  });
  test('Get Rekognition Tags from item confidence of 92.20275115966797', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-cat-pet-animal-domestic-104827.jpeg', confidence: '93'},
      response = await getRekognitionTags({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(response.statusCode).toEqual(200);
    expect(results.tags).toEqual([ 'Whale', 'Mammal', 'Sea Life', 'Animal' ]);
  });
  test('Get Rekognition Tags from item with no tags', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg'},
      response = await getRekognitionTags({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(response.statusCode).toEqual(200);
    expect(results.tags).toEqual([]);
  });
  test('Get Rekognition Tags s3key but no item in database', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3key: 'private/user/somethingthatdoesntexist'},
      response = await getRekognitionTags({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);

    expect(response.statusCode).toEqual(200);
    expect(results.tags.length).toEqual(0);
  });
  test('Get Rekognition Tags no s3key', async () => {
    const response = await getRekognitionTags({} as APIGatewayProxyEvent);
    expect(response.statusCode).toEqual(400);
  });
  test('Get items and collections between dates except items id 1 and 2', async () => {
    const
      queryStringParameters: QueryStringParameters = {date: '2011-07-01', id: '[1, 2]'},
      response = await homepage({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    console.log(results);
    expect(results.items.length).toEqual(3);
    expect(results.collections.length).toEqual(3);
  });
  test('Get items and collections between dates', async () => {
    const
      queryStringParameters: QueryStringParameters = {date: '2011-07-01'},
      response = await homepage({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(4);
    expect(results.collections.length).toEqual(3);
  });
  test('Test we can limit what we get back', async () => {
    const
      queryStringParameters: QueryStringParameters = {date: '2011-07-01', itemsLimit: '1'},
      response = await homepage({ queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.items.length).toEqual(1);
    expect(results.collections.length).toEqual(3);
  });
});
