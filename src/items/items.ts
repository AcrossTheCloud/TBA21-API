import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../common';
import { db } from '../databaseConnect';

export const getItems = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {// tslint:disable-line no-any
  try {
    return {
      body: JSON.stringify({
       message: await db.query(`select * from ${process.env.DB_NAME}.items`),
     }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('getItems ERROR - ', e);
    return badRequestResponse;
  }
};
