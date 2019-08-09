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
        table: Joi.string().valid('Profile', 'Collection', 'Item'),
        short_path: Joi.string().required()
      }),
      Joi.object().keys({
        table: Joi.string().valid('Profile', 'Collection', 'Item'),
        id: Joi.string().required()
      })));

    const
      queryString = event.queryStringParameters;
    let
      table = process.env.ITEMS_TABLE,
      column = 'short_path'; // set the default column name to short_path

    switch (queryString.table) {
      case 'Profiles':
        table =  process.env.PROFILES_TABLE;
        break;
      case 'Collections':
        table =  process.env.COLLECTIONS_TABLE;
        break;
      default:
        break;
    }

    // If we've passed in id instead of short_path, change the column to use id
    if (queryString.hasOwnProperty('id')) {
      column = 'id';
    }

    const
      params = [queryString.table, queryString[column]], // $1 table name, $2 queryString id or short_path
      sqlStatement = `
        SELECT *
        FROM (
          SELECT * 
          FROM ${process.env.SHORT_PATHS_TABLE}
          WHERE ${process.env.SHORT_PATHS_TABLE}.${column} = $2
          AND ${process.env.SHORT_PATHS_TABLE}.object_type = $1
        ) AS short_paths
          JOIN ${table}
          AS id_ on short_paths.id = id_.id
          ORDER BY short_path DESC
      `;

    return successResponse({short_path: await db.any(sqlStatement, params)});
  } catch (e) {
    console.log('/shortPaths.get ERROR - ', e);
    return badRequestResponse();
  }
};
