require('dotenv').config(
  {
    DEBUG: true,
    path: process.cwd() + (process.env.LOCAL ? '/.env' : '/.env-test')
  }
);

import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { QueryStringParameters } from '../../types/_test_';
import { get } from './collections';

afterAll( () => {
  // Close the database connection.
  db.$pool.end();
});

describe('/admin/collections/collections.get', () => {

  test('The function runs without queryStringParams', async () =>{
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(3);
  });

  test('Check we have a COUNT of 3', async () =>{
    const
      response = await get({} as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections[0].count).toEqual('3');
  });


  test('Check that we can limit the number of returned items.', async () =>{
    const
      queryStringParameters: QueryStringParameters = {limit: '1'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(1);
  });

  /*
    SELECT
      COUNT ( collection.ID ) OVER (),
      collection.*,
      json_agg(tag.*) AS aggregated_concept_tags
    FROM tba21.collections AS collection, UNNEST(collection.concept_tags) as tagid
    INNER JOIN tba21.concept_tags AS tag ON tag.ID = tagid
    GROUP BY collection.ID
    LIMIT 1 OFFSET 2
  */
  test('Pagination works', async () =>{
    const
      queryStringParameters: QueryStringParameters = {limit: '1', offset: '2'},
      response = await get({ queryStringParameters } as APIGatewayProxyEvent, {} as Context),
      item = JSON.parse(response.body);

    expect(item.collections.length).toEqual(1);
    expect(item.collections[0].title).toEqual('Quantum Aspects of Life');
  });

});
