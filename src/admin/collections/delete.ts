import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, headers } from '../../common';
import { db } from '../../databaseConnect';
import Joi from '@hapi/joi';

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
    // will cause an exception if it is not valid

    const
      params = [event.queryStringParameters.id],
      query = `
        DELETE FROM ${process.env.COLLECTIONS_TABLE}
        WHERE id = $1;

        DELETE FROM ${process.env.COLLECTIONS_ITEMS_TABLE}
        WHERE 'collection_id' = $1
      `;

    await db.any(query, params);

    return {
      body: 'true',
      headers: headers,
      statusCode: 200
    };
  } catch (e) {
    console.log('/admin/collections/delete ERROR - ', e);
    return badRequestResponse();
  }
};
