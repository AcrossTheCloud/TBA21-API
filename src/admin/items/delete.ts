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
    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.id] ,
      query = `
        DELETE FROM ${process.env.ITEMS_TABLE}
        WHERE items.id=$1
      `;
    await db.any(query, params);

    // if we have a short_path associated with that id, delete it
    const shortPathDelete = `
        DELETE FROM ${process.env.SHORT_PATHS_TABLE}
        WHERE EXISTS (
          SELECT * FROM ${process.env.SHORT_PATHS_TABLE}
          WHERE object_type = 'Item'
          AND id = $1
        )
      `;
    await db.any(shortPathDelete, params);
    
    return successResponse(true);
  } catch (e) {
    console.log('/items/items.deleteItem ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
