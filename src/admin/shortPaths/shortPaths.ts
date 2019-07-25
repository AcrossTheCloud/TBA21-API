import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, headers, successResponse } from '../../common';
import { db } from '../../databaseConnect';
import Joi from '@hapi/joi';

/**
 *
 * Get an item/profile/collection by its short_path
 *
 * @param event
 */
export const get = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      table: Joi.any().valid('Profile', 'Collection', 'Item'),
      short_path: Joi.string().required()
    }));
    const queryString = event.queryStringParameters;
    let table = process.env.ITEMS_TABLE;

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

    const
      params = [queryString.table, queryString.short_path],
      sqlStatement = `
        SELECT *
        FROM (
          SELECT * 
          FROM ${process.env.SHORT_PATHS_TABLE}
          WHERE ${process.env.SHORT_PATHS_TABLE}.short_path = $2
        ) AS short_paths
          JOIN ${table}
          AS id_ on short_paths.id = id_.id
      `;
    return successResponse({short_path: await db.any(sqlStatement, params)});
  } catch (e) {
    console.log('/profiles/shortPaths.get ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Insert a short path
 *
 * @param event
 */
export const insert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        short_path: Joi.string().required(),
        id: Joi.number().required(),
        object_type: Joi.any().valid('Profile', 'Collection', 'Item').required(),
      }));

    const
      params = [data.short_path, data.id, data.object_type],
      query = `
      INSERT INTO ${process.env.SHORT_PATHS_TABLE} (short_path,ID,object_type)
      VALUES ($1, $2, $3)
      RETURNING ${process.env.SHORT_PATHS_TABLE}.short_path;
    `;

    const insertResult = await db.task(async t => {
      return await t.one(query, params);
    });
    return {
      body: JSON.stringify({ success: true, short_path: insertResult }),
      headers: headers,
      statusCode: 200
    };
  } catch (e) {
    console.log('/profiles/shortPaths.insert ERROR - ', e);
    return badRequestResponse(e.message);
    }
};
//