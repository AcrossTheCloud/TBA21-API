import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../../common';
import { db } from '../../databaseConnect';
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
    let
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = ['private/user/' + queryString.s3_key] ,
      query = `
        DELETE FROM ${process.env.ITEMS_TABLE}
        WHERE items.s3_key='${params}'
      `;
    await db.any(query, params);
    return successResponse(true );
  } catch (e) {
    console.log('/items/items.deleteItem ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Delete items from a collection
 * uuid is passed through as part of the s3 key
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const deleteItemsFromCollection = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body);

    // if no s3 keys return bad response
    if (!body.s3_keys || body.s3_keys && !body.s3_keys.length) {
      return badRequestResponse('s3 keys required');
    }
    if (!body.id) {
      return badRequestResponse('id required');
    }

    const
      params = [body.id, body.s3_keys.map(key => `private/${key}`)],
      query = `
        DELETE FROM ${process.env.COLLECTIONS_ITEMS_TABLE}
        WHERE collection_id = $1
        AND item_s3_key = ANY (ARRAY [$2]);
      `;

    await db.any(query, params);
    return successResponse(true);
  } catch (e) {
    console.log('/items/items.deleteItemsFromCollection ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
