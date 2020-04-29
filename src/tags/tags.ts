import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Joi from '@hapi/joi';

import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import { limitQuery } from '../utils/queryHelpers';

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
    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      type: Joi.string().valid('keyword', 'concept').required(),
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      query: Joi.string()
    }));

    const
      defaultValues = { limit: 500, offset: 0 },
      queryString = event.queryStringParameters,
      params: (string | number)[] = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];

    let searchQuery = '';

    if (queryString.hasOwnProperty('query')) {
      searchQuery = `WHERE tag_name ILIKE '%' || $3 || '%'`;
      params.push(queryString.query);
    }

    const
      sqlStatement = `
        SELECT * 
          FROM ${queryString.type === 'concept' ? process.env.CONCEPT_TAGS_TABLE : process.env.KEYWORD_TAGS_TABLE}
          ${searchQuery}
        LIMIT $1
        OFFSET $2
      `;

    const result = await db.manyOrNone(sqlStatement, params);

    return successResponse({ tags: result ? result : [] });
  } catch (e) {
    console.log('/tags/tags.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
