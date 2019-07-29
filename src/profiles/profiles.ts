import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';
import { badRequestResponse, headers, internalServerErrorResponse, successResponse } from '../common';

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        id: Joi.number().integer().required()
      }));

    const
      queryString = event.queryStringParameters,
      params = [queryString.id],
      sqlStatement = `
        SELECT * 
        FROM ${process.env.PROFILES_TABLE}
        WHERE id = $1
      `;

    return successResponse({ profile: await db.any(sqlStatement, params) });

  } catch (e) {
    console.log('/profile/profile.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

export const insert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        contributors: Joi.array().items(Joi.string().required().regex('/^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i')),
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

    const query = `INSERT INTO ${process.env.PROFILES_TABLE} (${[...sqlFields]}) VALUES (${[...sqlParams]}) RETURNING id;`;

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
