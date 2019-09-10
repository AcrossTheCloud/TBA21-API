import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import Joi from '@hapi/joi';
import { db } from '../databaseConnect';

/**
 *
 * Get an announcement by its id
 *
 * @param event
 */
export const get = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
        id: Joi.number().integer().required()
      })
    ));
    const
      params = [event.queryStringParameters.id];

    const query = `
        SELECT *
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        WHERE status = true
        AND id = $1
      `;

    return successResponse({announcement: await db.oneOrNone(query, params) });

  } catch (e) {
    console.log('/announcements.get ERROR - ', e);
    return badRequestResponse();
  }
};
