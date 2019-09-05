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

    await Joi.validate(data, Joi.object().keys(
      {
        full_name: Joi.string().required(),
        uuid: Joi.string().uuid(uuidRegex).required()
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
        contact_email: Joi.string(),
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
