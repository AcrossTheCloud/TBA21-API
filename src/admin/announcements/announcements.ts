import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { badRequestResponse, headers } from '../../common';
import Joi from '@hapi/joi';

/**
 *
 * Insert an announcement
 *
 * @param event
 */
export const insert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        title: Joi.string().required(),
        description: Joi.string().required(),
        url: Joi.string()
      }));
    let paramCounter = 0;

    const
      params = [],
      sqlFields: string[] = Object.keys(data).map((key) => {
        return `${key}`;
      }),
      sqlParams: string[] = Object.keys(data).map((key) => {
        params[paramCounter++] = data[key];
        return `$${paramCounter}`;
      });

    sqlFields.push('created_at', 'status');
    sqlParams.push('now()', 'false');

    const
      query = `
        INSERT INTO ${process.env.ANNOUNCEMENTS_TABLE} (${[...sqlFields]}) 
        VALUES (${[...sqlParams]}) 
        RETURNING id;
      ;`;

    const insertResult = await db.one(query, params);

    return {
      body: JSON.stringify({ success: true, ...insertResult }),
      headers: headers,
      statusCode: 200
    };
  } catch (e) {
    console.log('admin/announcements.insert ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Delete an announcement by it's ID
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */
export const deleteAnnouncement = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        id: Joi.number().integer().required()
      }));

    const
      params = [event.queryStringParameters.id],
      query = `
        DELETE FROM ${process.env.ANNOUNCEMENTS_TABLE}
        WHERE id = $1;
      `;

    await db.any(query, params);

    return {
      body: 'true',
      headers: headers,
      statusCode: 200
    };
  } catch (e) {
    console.log('/admin/announcements/delete ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Update an announcement by it's ID
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */

export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        id: Joi.number().integer().required(),
        title: Joi.string(),
        description: Joi.string(),
        url: Joi.string(),
        status: Joi.boolean()
      }));

    let paramCounter = 0;

    const params = [];
    params[paramCounter++] = data.id;
    // pushed into from SQL SET map
    const SQL_SETS: string[] = Object.keys(data)
        .filter(e => (e !== 'id')) // remove id
        .map((key) => {
          params[paramCounter++] = data[key];

          return `${key}=$${paramCounter}`;
        }),
      query = `
        UPDATE ${process.env.ANNOUNCEMENTS_TABLE}
        SET 
          ${[...SQL_SETS]}
        WHERE id = $1 
        returning id;
      `;

    if (!SQL_SETS.length) {
      return badRequestResponse('Nothing to update');
    }

    // If we have items in SQL_SETS do the query.
    if (SQL_SETS.length) {
      await db.one(query, params);
    }

    return {
      body: JSON.stringify({ success: true }),
      headers: headers,
      statusCode: 200
    };

  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/announcements/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};
