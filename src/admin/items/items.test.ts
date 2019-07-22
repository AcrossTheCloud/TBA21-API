require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get, getByS3Key, getByTag } from './items';

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
  test('Get item with a specific s3 key', async () => {
    const
      queryStringParameters: QueryStringParameters = {s3Key: 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg'},
      response = await getByS3Key({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);
    expect(result.item.s3_key).toEqual('private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-rat-pet-animal-domestic-104827.jpeg');
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
});
