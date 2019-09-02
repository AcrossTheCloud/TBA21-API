import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import Joi from '@hapi/joi';
import { deleteCollection } from '../../collections/model';

/**
 *
 * Delete a collection by it's ID
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */
export const deleteById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        id: Joi.number().integer().required()
      }));

    const isAdmin = event.path.match(/\/admin\//) ? true : false;
    const userId = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await deleteCollection(Number(event.queryStringParameters.id), isAdmin, userId));

  } catch (e) {
    console.log('/admin/collections/delete ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
