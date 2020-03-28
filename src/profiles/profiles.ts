import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';
import {
  badRequestResponse,
  internalServerErrorResponse,
  successResponse,
} from '../common';
import { uuidRegex } from '../utils/uuid';
import { insertProfile, updateProfile, deleteUserProfile } from './model';

/**
 *
 * Get profile(s) by either it's id, uuid or search by full_name
 *
 * @param event
 */
export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
        id: Joi.number().integer()
      }),
      Joi.object().keys({
        uuid: Joi.string().allow('').allow(null).pattern(uuidRegex)
      }),
      Joi.object().keys({
        full_name: Joi.string().allow('').allow(null)
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
      whereStatement = `WHERE UNACCENT(full_name) ILIKE '%' || UNACCENT($1) || '%'`;
    }
    const sqlStatement = `
        SELECT *
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

    await Joi.assert(data, Joi.object().keys(
      {
        full_name: Joi.string().allow('').allow(null).required(),
        uuid: Joi.string().allow('').allow(null).uuid(uuidRegex).required()
      }));

    return (await insertProfile( data, false)) ;
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

    await Joi.assert(data, Joi.object().keys(
      {
        contributors: Joi.array().items(Joi.string().allow('').allow(null).pattern(uuidRegex)),
        profile_image: Joi.string().allow('').allow(null),
        featured_image: Joi.string().allow('').allow(null),
        full_name: Joi.string().allow('').allow(null),
        field_expertise: Joi.string().allow('').allow(null),
        city: Joi.string().allow('').allow(null),
        country: Joi.string().allow('').allow(null),
        biography: Joi.string().allow('').allow(null),
        website: Joi.string().allow('').allow(null),
        social_media: Joi.array().items(Joi.string().allow('').allow(null)),
        public_profile: Joi.boolean(),
        affiliation: Joi.string().allow('').allow(null),
        position: Joi.string().allow('').allow(null),
        contact_person: Joi.string().allow('').allow(null),
        contact_position: Joi.string().allow('').allow(null),
        contact_email: Joi.string().allow('').allow(null),
        accepted_license: Joi.boolean()
      }));
    const userId = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await updateProfile(data, false, userId)) ;

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
 * Delete a users own profile
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } true
 */
export const deleteProfile = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];
    return (await deleteUserProfile(false, userId));
  } catch (e) {
      console.log('/profile/profiles/deleteProfile ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
};
