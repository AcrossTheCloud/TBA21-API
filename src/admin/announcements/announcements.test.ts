
require('dotenv').config(
  {
    DEBUG: true
  }
);
import { QueryStringParameters } from '../../types/_test_';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { reSeedDatabase } from '../../utils/testHelper';
import { db } from '../../databaseConnect';
import { insert, update, deleteAnnouncement, get } from './announcements';

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
    expect(responseBody.id).toEqual('4');
  });
  test('Change the status of an announcement', async () => {
    const
      requestBody = {
        'id': '1',
        'status' : 'true'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({ body } as APIGatewayProxyEvent),
      responseBody = JSON.parse(response.body);
    expect(responseBody.success).toBe(true);
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
  });

  test('Get announcements for contributor', async () => {
    // Reseed as we have manipulated it above
    await reSeedDatabase();
    const
      queryStringParameters: QueryStringParameters = {},
      response = await get({ queryStringParameters, path: '/contributor/announcements', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.announcements.length).toEqual(3);
  });

  test('Get announcements for contributor with id of 1', async () => {
    const
      queryStringParameters: QueryStringParameters = { id: '1' },
      response = await get({ queryStringParameters, path: '/contributor/announcements', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.announcements.length).toEqual(1);
    expect(result.announcements[0].title).toEqual('Hello World');
  });
  test('Admin get all announcements', async () => {
    const
      queryStringParameters: QueryStringParameters = {},
      response = await get({ queryStringParameters, path: '/admin/announcements', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.announcements.length).toEqual(3);
  });
  test('Admin get announcements by id 1', async () => {
    const
      queryStringParameters: QueryStringParameters = { id: '1'},
      response = await get({ queryStringParameters, path: '/admin/announcements', requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:cfa81825-2716-41e2-a48d-8f010840b559'
          }
        }} as APIGatewayProxyEvent, {} as Context),
      result = JSON.parse(response.body);

    expect(result.announcements.length).toEqual(1);
    expect(result.announcements[0].title).toEqual('Hello World');
  });
});
