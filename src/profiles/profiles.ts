import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';
import { badRequestResponse, successResponse } from '../common';

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

    const result = await db.manyOrNone(sqlStatement, params);

    return successResponse({ profile: result });
  } catch (e) {
    console.log('/profile/profile.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};