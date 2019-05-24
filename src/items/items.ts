import { APIGatewayProxyResult } from 'aws-lambda';
import { Connection } from 'typeorm';
import { Item } from '../entity/items';
import { badRequestResponse } from '../common'; // tslint:disable-line no-implicit-dependencies (Using only the type information from the @types package.)

export const getItems = async (pgConnection: Connection, queryString?: any): Promise<APIGatewayProxyResult> => {// tslint:disable-line no-any
  try {

    return {
      body: JSON.stringify({
       message: await pgConnection.manager.find(Item),
     }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('Edfgdgdfgdfgdfgdfgdfgdfgdfgdf,gdf,g,df,gd,fg -- ', e);
    return badRequestResponse;
  }
};
