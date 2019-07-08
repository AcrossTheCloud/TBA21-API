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
          "s3_key": "private/user/key1",
          "cast_": "changed_cast",
          "title": "changed_title"
        },
        body: string = JSON.stringify(requestBody),
        response = await updateByS3key({ body } as APIGatewayProxyEvent),
        responseBody = JSON.parse(response.body);
        //console.log(responseBody);
  
      expect(responseBody.success).toBe(true);
    });
  
    test('Check that supplying just the s3_key returns a 400', async () => {
      const
        requestBody = { "s3_key": "private/user/key1" },
        body: string = JSON.stringify(requestBody),
        response = await updateByS3key({ body } as APIGatewayProxyEvent),
        responseBody = JSON.parse(response.body);
  
      expect(responseBody.message).toEqual('Nothing to update');
    });
  
    test('Get a bad response when no s3_key is given', async () => {
        const
          requestBody = { "s3_key": "" },
          body: string = JSON.stringify(requestBody),
          response = await updateByS3key({ body } as APIGatewayProxyEvent);
         
    
        expect(response.statusCode).toEqual(400);
      });
  });
  