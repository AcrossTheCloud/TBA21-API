require('dotenv').config(
  {
    DEBUG: true
  }
);

import { APIGatewayProxyEvent } from 'aws-lambda';
import { deleteProfile, insert, update } from './profiles';
import { db } from '../databaseConnect';
import { reSeedDatabase } from '../utils/testHelper';

describe('Profile tests', () => {
  // AfterAll tests reseed the DB
  afterAll( async () => {
    await reSeedDatabase();
    // Close the database connection.
    db.$pool.end();
  });

  test('Test a user can update their profile', async () => {
    const
      requestBody = {
        'full_name': 'updated',
        'city': 'cat cafe',
        'country': 'city of rats'
      },
      body: string = JSON.stringify(requestBody),
      response = await update({
        body, requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:236c0d78-bfcc-4645-8383-ef632afcb7c7'
          }
        }
      } as APIGatewayProxyEvent);
    expect(response.body).toContain('success');
  });
  test('Test a user can insert a profile', async () => {
    const
      requestBody = {
        'full_name': 'inserted',
        'uuid': '7ba0060a-064b-489d-a7de-a30866a510d0'
      },
      body: string = JSON.stringify(requestBody),
      response = await insert({ body } as APIGatewayProxyEvent);
    expect(response.body).toContain('success');
  });
  test('Test a user can delete their profile', async () => {
    const
      response = await deleteProfile ({
        requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:236c0d78-bfcc-4645-8383-ef632afcb7c7'
          }
        }
      } as APIGatewayProxyEvent);
    expect(response.body).toContain('success');
  });
  test('Accept License', async () => {
    const
      requestBody = {
        'accepted_license': true
      },
      body: string = JSON.stringify(requestBody),
      response = await update({
          body, requestContext: {
          identity: {
            cognitoAuthenticationProvider: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx:CognitoSignIn:4b5981b0-6897-46de-b36e-1ebd125fc1cb'
          }
        }
      } as APIGatewayProxyEvent);
    expect(response.body).toContain('success');
  });
});
