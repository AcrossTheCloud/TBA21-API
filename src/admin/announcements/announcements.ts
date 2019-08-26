import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { badRequestResponse, headers, successResponse } from '../../common';
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
 * Publish or un-publish an announcement
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:Announcement - an list of the results
 */
export const changeStatus = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      id: Joi.string().required(),
      status: Joi.boolean().required()
    }));
    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.status, queryString.id],
      query = `
        UPDATE ${process.env.ANNOUNCEMENTS_TABLE}
        SET status = $1 
        WHERE id  = $2 
        RETURNING id, status
      `;

    return successResponse({ updatedAnnouncement: await db.one(query, params) });
  } catch (e) {
    console.log('/admin/announcements.changeStatus ERROR - ', !e.isJoi ? e : e.details);
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
export const deleteById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

export const updateById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        id: Joi.number().integer().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
        url: Joi.string(),
        status: Joi.boolean()
      }));

    let paramCounter = 0;

    const params = [];
    params[paramCounter++] = data.id;
    // pushed into from SQL SET map
    const SQL_SETS: string[] = Object.keys(data)
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

/**
 *
 * Get an announcement by its id
 *
 * @param event
 */
export const get = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // We expect either short_path or id and it is required
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

    return successResponse({short_paths: await db.any(sqlStatement, params) });
  } catch (e) {
    console.log('/shortPaths.get ERROR - ', e);
    return badRequestResponse();
  }
};