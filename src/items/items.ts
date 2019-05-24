import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../common'; // tslint:disable-line no-implicit-dependencies (Using only the type information from the @types package.)

import { db } from '../databaseConnect';

export const getItems = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {// tslint:disable-line no-any
  try {
    return {
      body: JSON.stringify({
       message: await db.query('select * from tba21.items'),
     }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('eeee -- ', e);
    return badRequestResponse;
  }
};
