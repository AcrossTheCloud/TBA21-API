import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Joi from '@hapi/joi';

import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';

/**
 *
 * Get an array of Tags
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } List of tags
 */
export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      type: Joi.string().valid('keyword', 'concept').required(),
      query: Joi.string().required()
    }));

    const
      { type, query } = event.queryStringParameters,
      params = [query],
      sqlStatement = `
        SELECT * 
          FROM ${type === 'concept' ? process.env.CONCEPT_TAGS_TABLE : process.env.KEYWORD_TAGS_TABLE}
        WHERE tag_name LIKE '%' || LOWER($1) || '%'
      `;

    const result = await db.any(sqlStatement, params);

    return successResponse({ tags: result ? result : [] });
  } catch (e) {
    console.log('/tags/tags.get ERROR - ', e);
    return badRequestResponse();
  }
};
