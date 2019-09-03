import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';
import {
  badRequestResponse,
  headers,
  internalServerErrorResponse,
  successResponse,
  unAuthorizedRequestResponse
} from '../common';
import { uuidRegex } from '../utils/uuid';

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
          profiles.accepted_license
        FROM ${process.env.PROFILES_TABLE}
        ${whereStatement}
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
        full_name: Joi.string().required(),
        uuid: Joi.string().regex(uuidRegex).required()
      }));

    const params = [data.full_name, data.uuid];
    const query = `
      INSERT INTO ${process.env.PROFILES_TABLE} 
        (full_name, cognito_uuid, profile_type, accepted_license) 
      VALUES 
        ($1, $2::uuid, 'Public', false) 
      RETURNING id;`;

    const result = await db.one(query, params);

    return {
      body: JSON.stringify({ success: true, id: result.id }),
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
        contributors: Joi.array().items(Joi.string().regex(uuidRegex)),
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
        contact_email: Joi.string()
      }));

    let paramCounter = 1;
    const
      userUuid = event.requestContext.authorizer.claims['cognito:username'],
      params = [userUuid];

    // if the users uuid is the same as the profiles, allow them to edit it
    if (userUuid) {
      const SQL_SETS: string[] = Object.keys(data).map((key) => {
          params[paramCounter++] = data[key];
          return `${key}=$${paramCounter}`;
        }),
        query = `
          UPDATE ${process.env.PROFILES_TABLE}
          SET 
            ${SQL_SETS}
          WHERE cognito_uuid = $1::uuid
          returning id
        `;
      await db.one(query, params);

      return {
        body: 'true',
        headers: headers,
        statusCode: 200
      };
    } else {
      return unAuthorizedRequestResponse('You might not be logged in.');
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
