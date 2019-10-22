require('dotenv').config(
  {
    DEBUG: true
  });

import { APIGatewayProxyEvent } from 'aws-lambda';
import { reSeedDatabase } from '../../utils/testHelper';
import { db } from '../../databaseConnect';
import { update, insert, remove } from './tags';

afterAll(async () => {
  await reSeedDatabase();
  // Close the database connection.
  db.$pool.end();
});

describe('Tag insert tests', () => {
  test('Insert 1 keyword tag and check the result', async () => {
    const
      requestBody = {
        'tags': ['Espeon']
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.tags.length).toEqual(1);
    expect(responseBody.tags[0]).toMatchObject({ 'id': '11', 'tag_name': 'Espeon' });
  });

  test('Insert 1 keyword that doesn\'t exist tag and check the results', async () => {
    const
      requestBody = {
        'tags': ['Pikachu', 'Eevee']
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.tags.length).toEqual(2);
    expect(responseBody.tags).toEqual(expect.arrayContaining([{ 'id': '12', 'tag_name': 'Pikachu'}, {'id': '13', 'tag_name': 'Eevee' }]));
  });
});
describe('Tag update and delete tests', () => {
  test('Update 1 keyword tag and check the result', async () => {
    const
      requestBody = {
        'id': 1,
        'new_tag_name': 'changed keyword tag'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.updatedTag.tag_name).toEqual('changed keyword tag');
    expect(responseBody.updatedTag.id).toEqual('1');

  });
  test('Delete 1 keyword tag and check the result', async () => {
    const
      requestBody = {
        'id': 7
      },
      body: string = JSON.stringify(requestBody),
      response = await remove({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody).toEqual(true);
  });
  test('Delete 1 keyword tag thats in use and check the result', async () => {
    const
      requestBody = {
        'id': 1
      },
      body: string = JSON.stringify(requestBody),
      response = await remove({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.message).toEqual('Cannot delete a tag that is being used');

  });
});