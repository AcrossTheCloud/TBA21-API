import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import Joi from 'joi';
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
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        id: Joi.number().integer().required()
      }));

    const isAdmin: boolean = !!event.path.match(/\/admin\//);
    const userId: string | null = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await deleteCollection(Number(event.queryStringParameters.id), isAdmin, userId));

  } catch (e) {
    console.log('/admin/collections/delete ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
