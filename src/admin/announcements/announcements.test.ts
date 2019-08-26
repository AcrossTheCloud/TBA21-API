require('dotenv').config(
  {
    DEBUG: true
  }
);
import { QueryStringParameters } from '../../types/_test_';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { reSeedDatabase } from '../../utils/testHelper';
import { db } from '../../databaseConnect';
import { insert, changeStatus } from './announcements';

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
    expect(responseBody.id).toEqual('2');
  });
  test('Change the status of an announcement', async () => {
    const
      queryStringParameters: QueryStringParameters = {status: 'false', id: '1'},
      response = await changeStatus({queryStringParameters } as APIGatewayProxyEvent),
      results = JSON.parse(response.body);
    console.log(results);
    expect(results.updatedAnnouncement.status).toEqual(false);
  });

});
