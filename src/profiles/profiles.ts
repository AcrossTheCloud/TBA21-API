import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';
import { badRequestResponse, headers, internalServerErrorResponse, successResponse } from '../common';

/**
 *
 * Get a profile by its id
 *
 * @param event
 */
export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        id: Joi.number().integer().required()
      }));

    const
      queryStringParameters = event.queryStringParameters,
      params = [queryStringParameters.id],
      sqlStatement = `
        SELECT * 
        FROM ${process.env.PROFILES_TABLE}
        WHERE id = $1
        AND public_profile = true
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
        profile_image: Joi.string(),
        featured_image: Joi.string(),
        full_name: Joi.string().required(),
        field_expertise: Joi.string(),
        city: Joi.string(),
        country: Joi.string().required(),
        biography: Joi.string(),
        website: Joi.string(),
        social_media: Joi.array().items(Joi.string()),
        public_profile: Joi.boolean().required(),
        affiliation: Joi.string(),
        position: Joi.string(),
        contact_person: Joi.string(),
        contact_position: Joi.string(),
        contact_email: Joi.string().required(),
        profile_type: Joi.any().valid('Individual', 'Collective', 'Institution').required()
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

    const query = `
      INSERT INTO ${process.env.PROFILES_TABLE} 
        (${[...sqlFields]}) 
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
        id: Joi.number().integer().required(),
        profile_image: Joi.string(),
        featured_image: Joi.string(),
        full_name: Joi.string(),
        field_expertise: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
        biography: Joi.string(),
        website: Joi.string(),
        social_media: Joi.array().items(Joi.string()),
        public_profile: Joi.boolean(),
        affiliation: Joi.string(),
        position: Joi.string(),
        contact_person: Joi.string(),
        contact_position: Joi.string(),
        contact_email: Joi.string(),
        profile_type: Joi.any().valid('Individual', 'Collective', 'Institution')
      }));

    let paramCounter = 0;

    const params = [];
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
    } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/profile/profiles/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};

/**
 *
 * Search profiles
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } List of profiles
 */
export const search = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      query: Joi.string().required()
    }));

    const
      { query } = event.queryStringParameters,
      params = [query],
      sqlStatement = `
        SELECT 
          profiles.id,
          profiles.full_name,
          profiles.profile_type,
          profiles.affiliation
        FROM ${process.env.PROFILES_TABLE}
        WHERE 
          LOWER(full_name) LIKE LOWER($1) || '%'
        AND public_profile = true
      `;
    const result = await db.any(sqlStatement, params);

    return successResponse({ profile: result ? result : [] });
  } catch (e) {
    console.log('/profile/profile.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};