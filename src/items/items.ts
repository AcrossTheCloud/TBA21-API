import { APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse } from '../common'; // tslint:disable-line no-implicit-dependencies (Using only the type information from the @types package.)

export const getItems = async (queryString?: any): Promise<APIGatewayProxyResult> => {// tslint:disable-line no-any
  try {

    return {
      body: JSON.stringify({
       message: 'Hi',
     }),
      statusCode: 200,
    };
  } catch (e) {
    return badRequestResponse;
  }
};
