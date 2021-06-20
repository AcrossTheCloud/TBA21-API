import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from 'joi';
import {
  badRequestResponse,
  internalServerErrorResponse,
  successResponse,
  unAuthorizedRequestResponse,
} from '../common';

const AWS=require('aws-sdk');
const CognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

import { insertProfile, updateProfile, deleteUserProfile } from './model';
/**
 *
 * Get profile(s) by either it's id, uuid or search by full_name
 *
 * @param event
 */

export const getCurrent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const uuid = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];
    const params = [uuid];

    const sqlStatement = `
        SELECT *
        FROM ${process.env.PROFILES_TABLE}
        WHERE cognito_uuid = $1
      `;

    const profile = await db.oneOrNone(sqlStatement, params);
    if (!profile) {
      throw Error;
    }
    return successResponse({ profile });
  } catch {
    console.log('/profiles/profile.getCurrent ERROR - ');
    return unAuthorizedRequestResponse();
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
        uuid: Joi.string().allow('').allow(null).uuid().required(),
        public_profile: Joi.boolean().required(),
        profile_type: Joi.any().valid('Individual', 'Collective', 'Institution', 'Public')
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
        contributors: Joi.array().items(Joi.string().uuid()),
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
        accepted_license: Joi.boolean(),
        favourites: Joi.object().allow(null)
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

export const get = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(
      event.queryStringParameters,
      Joi.object().keys({
        id: Joi.number().integer().required()
      })
    );
    const params = [event.queryStringParameters.id];
    const sqlStatement = `SELECT * FROM ${process.env.PROFILES_TABLE} WHERE id = $1 AND public_profile = TRUE`;
    let profile = await db.any(sqlStatement, params);

    return successResponse({ profile });
  } catch (e) {
    console.log('/profile/profiles/get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

export const getNamesByEmails = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(
      event.queryStringParameters,
      Joi.object().keys({
        emails: Joi.array().items(Joi.string()).required()
      })
    );
    let userIds = [];
    await Promise.all(JSON.parse(event.queryStringParameters.emails).map(async (email) => {
      const cogintoRequest = {
        AttributesToGet: [ 'sub', 'email' ],
        'Filter': `email="${email}"`,
        'UserPoolId': process.env.UserPoolId
      }
      const cognitoResult = await CognitoIdentityServiceProvider.listUsers(cogintoRequest).promise();

      cognitoResult.Users.map(async (user) => {
        userIds.push(user.Username)
      });

    }));
    const dbResult = await db.any(`SELECT cognito_uuid, full_name FROM tba21.profiles WHERE cognito_uuid IN ($1:csv)`, [userIds]);

    return successResponse(dbResult);
  } catch (e) {
    console.log('/profile/profiles/get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};