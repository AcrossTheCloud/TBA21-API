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
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:{ boolean }
 */
export const deleteItem = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const queryString = event.queryStringParameters;
    const isAdmin: boolean = !!event.path.match(/admin\/items/i);
    const userId: string | null = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await deleteItm(String(queryString.s3Key), isAdmin, userId));

  } catch (e) {
    console.log('/items/items.deleteItem ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
