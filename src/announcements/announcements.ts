import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import Joi from 'joi';
import { db } from '../databaseConnect';
import { limitQuery } from '../utils/queryHelpers';

/**
 *
 * Get an announcement by its id
 *
 * @param event
 */
export const get = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.queryStringParameters) {
      event.queryStringParameters = {};
    }

    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      id: Joi.number().integer(),
      limit: Joi.number().integer(),
      offset: Joi.number().integer()
    }));

    const
      queryString = event.queryStringParameters,
      defaultValues = { limit: 15, offset: 0 },
      params = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];

    if (queryString.id) {
      params.push(queryString.id);
    }

    const query = `
        SELECT *
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        WHERE status = true
        ${queryString.id ? 'AND id = $3' : ''}
        ORDER BY created_at DESC
        LIMIT $1
        OFFSET $2
      `;

    return successResponse({announcements: await db.manyOrNone(query, params) });

  } catch (e) {
    console.log('/announcements.get ERROR - ', e);
    return badRequestResponse();
  }
};
