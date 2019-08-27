
require('dotenv').config(
  {
    DEBUG: true
  }
);
import { QueryStringParameters } from '../../types/_test_';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { reSeedDatabase } from '../../utils/testHelper';
import { db } from '../../databaseConnect';
import { insert, changeStatus, get, update, deleteAnnouncement } from './announcements';

describe('admin/announcements', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('insert for announcements', async () => {
    const
      requestBody = {
        'title': 'new title',
        'description': 'new description'
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.id).toEqual('3');
  });
  test('Change the status of an announcement', async () => {
    const
      queryStringParameters: QueryStringParameters = {status: 'true', id: '2'},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.updatedAnnouncement.status).toEqual(true);
  });
  test('Get an announcement by its id', async () => {
    const
      queryStringParameters: QueryStringParameters = {id: '1'},
      response = await get({queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results.announcement.id).toEqual('1');
  });
  test('Update the title with an ID 1', async () => {
    const
      requestBody = {
        'id': '1',
        'title' : 'updated title'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);

    expect(responseBody.success).toBe(true);
  });
  test('Delete an the announcement with an id of 2', async () => {
    let
      queryStringParameters: QueryStringParameters = {id: '2'},
      response = await deleteAnnouncement({queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    expect(results).toBe(true);

    queryStringParameters = {
      id: '2'
    },
      response = await get({queryStringParameters} as APIGatewayProxyEvent);
    results = JSON.parse(response.body);
    expect(results.announcement).toEqual(null);
  });
});
