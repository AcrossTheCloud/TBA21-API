import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import { deleteItm } from '../../items/model';
/**
 *
 * Delete an item
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const deleteItem = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const queryString = event.queryStringParameters;
    const isAdmin = !!event.path.match(/\/admin\//);
    const userId = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await deleteItm(Number(queryString.id), isAdmin, userId));

  } catch (e) {
    console.log('/items/items.deleteItem ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
