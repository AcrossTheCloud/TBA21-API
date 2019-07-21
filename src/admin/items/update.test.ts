require('dotenv').config(
    {
      DEBUG: true
    }
  );

import { APIGatewayProxyEvent } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { reSeedDatabase } from '../../utils/testHelper';
import { updateByS3key } from './update';

describe('/admin/items/update/updateByS3key', () => {

    // AfterAll tests reseed the DB
    afterAll( async () => {
      await reSeedDatabase();
      // Close the database connection.
      db.$pool.end();
    });

    test('Update ID updateByS3key', async () => {
      const
        requestBody = {
          's3_key': 'private/eu-central-1:80f1e349-677b-4aed-8b26-896570a8073c/ad742900-a6a0-11e9-b5d9-1726307e8330-dog-pet-animal-domestic-104827.jpeg',
          'cast_': 'changed_cast',
          'title': 'changed_title'
        },
        body: string = JSON.stringify(requestBody),
        response = await updateByS3key({ body } as APIGatewayProxyEvent),
        responseBody = JSON.parse(response.body);
      console.log(body, response, responseBody);
      expect(responseBody.success).toBe(true);
    });

    test('Get a bad response when no s3_key is given', async () => {
        const
          requestBody = { 's3_key': '' },
          body: string = JSON.stringify(requestBody),
          response = await updateByS3key({ body } as APIGatewayProxyEvent);

        expect(response.statusCode).toEqual(400);
      });
  });
