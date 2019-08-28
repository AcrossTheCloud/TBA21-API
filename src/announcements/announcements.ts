import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

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
                          id: Joi.number().integer().required(),
                        })
    ));

    const queryString = event.queryStringParameters;

    const
      params = [queryString.id],
      sqlStatement = `
          SELECT *
          FROM ${process.env.ANNOUNCEMENTS_TABLE}
          WHERE id = $1
          AND status = true
      `;

    return successResponse({announcement: await db.oneOrNone(sqlStatement, params) });
  } catch (e) {
    console.log('/announcements.get ERROR - ', e);
    return badRequestResponse();
  }
};