require('dotenv').config(
  {
    DEBUG: true,
    path: process.cwd() + (process.env.LOCAL ? '/.env' : '/.env-test')
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../databaseConnect';
import { QueryStringParameters } from '../types/_test_';
import { get, getById, getByTag } from './items';

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

  test('Check that the first row is populated and has specific values.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items[0].id).toEqual('2');
    expect(results.items[0].place).toEqual('place');
  });

  test('Check that the second row is populated and has specific values.', async () => {
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items[1].id).toEqual('3');
    expect(results.items[1].s3_key).toEqual('E7vhTh5FAl80gmxN7ifNMnrIlBzBZxaKvnJZBO32jQpFQIDodOTgBwRuPeFs9XYVGj8h8chmEZUSGygOdkSGLucpRiO46owykUxPruwVllVW2jGO0e9Wu3M4hTRa2G5mrxRrORMPANKFS2fU4drhjhoQxDo8Lld4hC3B9WMBgzkLt5YGvif372ktvSGxMy0LnKZUsZuidkrPxjeEwYxMIcQyqxYcf3w5ceXxg77FPjcqSkFnwYqDdbXLlQL6Zc3E1QXVt2P2UJSbGWnX6hqYnnEE8Qh1dpJIoEifUvHPNazEMizZpVZYTMA1wsz2sejM1fTdz466bGFlYJqe5LHLX3paYgu0Bv97L7Gzm2e0Phm9LNPQiRj9Xf0vNgw3jPGfHNvN8nZ019kcKMv4y79C3cbjHYm4dujRvOoLMWzb6XWyU60iDaye7NFiB8UWqwsUVMXYU2bZhVRjsGB30xxAoilQusHO9GGmnw78sp6kQP0YzggT2f9oXUTp9UZfxcUeLJ4PmQdWaHChBqEH5d9WoqeG2kH5BVPJl33fo9TUqc0IZu4oepZ55BuQwpZflIu6KWWpr24NUqsZecbZyxlgKR28Nvu7QW8uBRje0KESqwgklvRemyctuPqhnPZSlTy0EHc5421mU0rXObN82eUxYAJpxHDqamm9T5NJh6Mhn0p9wJyHEe7JbL1FZ32cVV1CCZG9b7x77JIkEiCxxfRJHLEdv0Fo7mYjxbqQFUk1VsNcANJKC5fpR1nU1e2AW1AW41FKlYSbURdK8BFhwYQTcq32Xhk9ouMZkh8dHOZxkPpsTiBZNsMZ6bGC5xXR664MQ3xn3rOuCjuSMjZiW2TmD2eNRUhz7u7gGqwNPIacWBYurAd919GuSmUc3HzqQxj4tWwUzpAlHgNnbDd3ekGMF5S3XQqhIgaSsHcHgm6fNWNQbi5RKgwYUwu5vmWMWF6hCzwrigcuPPndfjJpIINCx4ulRtLY814qPPYrYfwjYFCKI1rPkmQVFZ');
  });
});

describe('/items/getById', () => {
  test('Get item by id of 2', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await getById({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items[0].id).toEqual('2');
  });
  test(`Check an item with a status of false isn't returned`, async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await getById({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      results = JSON.parse(response.body);

    expect(results.items.length).toEqual(0);
  });
  test('Get a bad response when no id is given', async () => {
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
