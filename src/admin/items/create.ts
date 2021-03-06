import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, internalServerErrorResponse } from '../../common';
import Joi from 'joi';
import { create } from '../../items/model';

/**
 *
 *  Create an item by embed url
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */

export const createItem = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    if (!data.url) {
      return badRequestResponse();
    }

    await Joi.assert(data, Joi.object().keys(
      {
        url: Joi.string().uri().required(),
      }));

    const userId = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];
    console.log(userId, data.url);
  
    return (await create(data, userId));
  } catch (e) {    
    console.log('/admin/items/create ERROR - ', !e.isJoi ? e : e.details);
    return e.isJoi ? badRequestResponse() : internalServerErrorResponse();
  }
};
