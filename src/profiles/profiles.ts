import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';
import { badRequestResponse, headers, internalServerErrorResponse, successResponse } from '../common';

const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i;

/**
 *
 * Get profile(s) by either it's id, uuid or search by full_name
 *
 * @param event
 */
export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
                          id: Joi.number().integer()
                        }),
      Joi.object().keys({
                          uuid: Joi.string().regex(uuidRegex)
                        }),
      Joi.object().keys({
                          full_name: Joi.string()
                        })
    ));

    const
      queryStringParameters = event.queryStringParameters,
      params = [];
    let whereStatement = '';
    // checks to see what has been passed through, and changing the WHERE statement to suit as well as pushing queryStringParameters in to params[]
    if (queryStringParameters.hasOwnProperty('id')) {
      params.push(queryStringParameters.id);
      whereStatement = 'WHERE id = $1';
    }
    if (queryStringParameters.hasOwnProperty('uuid')) {
      params.push(queryStringParameters.uuid);
      whereStatement = 'WHERE cognito_uuid = $1';
    }
    if (queryStringParameters.hasOwnProperty('full_name')) {
      params.push(queryStringParameters.full_name);
      whereStatement = `WHERE LOWER(full_name) LIKE  '%' || LOWER($1) || '%'`;
    }
    const sqlStatement = `
        SELECT 
          profiles.id,
          profiles.full_name,
          profiles.profile_type,
          profiles.cognito_uuid
        FROM ${process.env.PROFILES_TABLE}
        ${whereStatement}
        WHERE public_profile = true
      `;
    return successResponse({ profile: await db.any(sqlStatement, params) });
  } catch (e) {
    console.log('/profile/profile.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Create a profile
 *
 * @param event
 */
export const insert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        full_name: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
      }));
    let paramCounter = 0;
    const userUuid = event.requestContext.authorizer.claims['cognito:username'];
    // if we have a user uuid from cognito, allow them to make a profile.
    if (userUuid) {
      const
        params = [],
        sqlFields: string[] = Object.keys(data).map((key) => {
          return `${key}`;
        }),
        sqlParams: string[] = Object.keys(data).map((key) => {
          params[paramCounter++] = data[key];
          return `$${paramCounter}`;
        });
      const query = `
        INSERT INTO ${process.env.PROFILES_TABLE} 
          (${[...sqlFields]}, cognito_uuid) 
        VALUES 
          (${[...sqlParams]}) 
        RETURNING id;`;
      const insertResult = await db.task(async t => {
        return await t.one(query, params);
      });

      return {
        body: JSON.stringify({ success: true, id: insertResult.id }),
        headers: headers,
        statusCode: 200
      };
    } else {
    return badRequestResponse();
  }
  } catch (e) {
    if ((e.message === 'Nothing to insert') || (e.isJoi)) {
      return badRequestResponse(e.message);
    } else {
      console.log('/profiles/profiles/insert ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
/**
 *
 * Update a profile
 *
 * @param event
 */
export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const
      data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        full_name: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
      }));

    let paramCounter = 0;
    const 
      userUuid = event.requestContext.authorizer.claims['cognito:username'],
      params = [];

    // if the users uuid is the same as the profiles, allow them to edit it
    if (userUuid === data.uuid) {
      params[paramCounter++] = data.id;

      const SQL_SETS: string[] = Object.keys(data)
          .map((key) => {
            params[paramCounter++] = data[key];
            return `${key}=$${paramCounter}`;
          }),
        query = `
          UPDATE ${process.env.PROFILES_TABLE}
          SET 
            ${[...SQL_SETS]}
          WHERE id = $1 returning id;
        `;
      await db.one(query, params);
      
      return {
        body: 'true',
        headers: headers,
        statusCode: 200
      };
    } else {
      return badRequestResponse();
    }
  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/profile/profiles/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};