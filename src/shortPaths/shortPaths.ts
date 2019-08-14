import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

/**
 *
 * Get an item/profile/collection by it's id or its short path
 *
 * @param event
 */
export const get = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // We expect either short_path or id and it is required
    await Joi.validate(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
        table: Joi.string().valid('Profile', 'Collection', 'Item').required(),
        short_path: Joi.string().required()
      }),
      Joi.object().keys({
        table: Joi.string().valid('Profile', 'Collection', 'Item').required(),
        id: Joi.string().required()
      })));

    const queryString = event.queryStringParameters;
    let column = 'short_path'; // set the default column name to short_path

    // If we've passed in id instead of short_path, change the column to use id
    if (queryString.hasOwnProperty('id')) {
      column = 'id';
    }

    const
      params = [queryString.table, queryString[column]], // $1 table name, $2 queryString id or short_path
      sqlStatement = `

          SELECT 
          short_path, id, object_type
          FROM ${process.env.SHORT_PATHS_TABLE}
          WHERE ${process.env.SHORT_PATHS_TABLE}.${column} = $2
          AND ${process.env.SHORT_PATHS_TABLE}.object_type = $1
          ORDER BY short_paths.created_at DESC
      `;

    return successResponse({short_paths: await db.any(sqlStatement, params) });
  } catch (e) {
    console.log('/shortPaths.get ERROR - ', e);
    return badRequestResponse();
  }
};
