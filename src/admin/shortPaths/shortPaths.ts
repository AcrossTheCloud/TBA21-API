import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { badRequestResponse, headers } from '../../common';
import Joi from '@hapi/joi';

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
        object_type: Joi.any().valid('Profile', 'Collection', 'Item').required()
      }));

    const
      params = [data.short_path, data.id, data.object_type],
      query = `
      INSERT INTO ${process.env.SHORT_PATHS_TABLE} (short_path, ID, object_type, created_at)
      VALUES ($1, $2, $3, now())
      RETURNING ${process.env.SHORT_PATHS_TABLE}.short_path;
    `;

    const insertResult = await db.one(query, params);

    return {
      body: JSON.stringify({ success: true, ...insertResult }),
      headers: headers,
      statusCode: 200
    };
  } catch (e) {
    console.log('shortpath/shortPaths.insert ERROR - ', e);
    if (e.toString().includes('duplicate key')) {
      return {
        body: JSON.stringify({ conflict: true }),
        headers: headers,
        statusCode: 409
      };
    }
    return badRequestResponse();
  }
};
