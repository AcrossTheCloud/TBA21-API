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
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      type: Joi.string().valid('keyword', 'concept').required(),
      limit: Joi.number().integer()
    }));

    const
      defaultValues = { limit: 15 },
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [limitQuery(queryString.limit, defaultValues.limit)],
      sqlStatement = `
        SELECT * 
          FROM ${queryString.type === 'concept' ? process.env.CONCEPT_TAGS_TABLE : process.env.KEYWORD_TAGS_TABLE}
        LIMIT $1
      `;

    const result = await db.manyOrNone(sqlStatement, params);

    return successResponse({ tags: result ? result : [] });
  } catch (e) {
    console.log('/tags/tags.get ERROR - ', e);
    return badRequestResponse();
  }
};

/**
 *
 * Get an array of Tags
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } List of tags
 */
export const search = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
        WHERE LOWER(tag_name) LIKE '%' || LOWER($1) || '%'
      `;

    const result = await db.any(sqlStatement, params);

    return successResponse({ tags: result ? result : [] });
  } catch (e) {
    console.log('/tags/tags.get ERROR - ', e);
    return badRequestResponse();
  }
};

/**
 *
 * Insert Tags from an array of strings
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } an array of tag objects {id: number, tag_name: string}
 */
export const insert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys({
      type: Joi.string().valid('keyword', 'concept').required(),
      tags: Joi.array().items(Joi.string()).required()
    }));

    const
      { type, tags } = data,
      tableName = type === 'concept' ? process.env.CONCEPT_TAGS_TABLE : process.env.KEYWORD_TAGS_TABLE,
      sqlStatement = `
        WITH tag AS
        (
          SELECT * FROM ${tableName} WHERE LOWER(tag_name) = LOWER($1)
        ),
        i AS
        (
          INSERT INTO ${tableName}(tag_name)
            VALUES ($1) ON CONFLICT (tag_name) DO NOTHING
          RETURNING id, tag_name
        )

        SELECT * FROM tag UNION ALL SELECT * FROM i;
      `;

    const results = [];
    // Loop through each tag and do a query, returning the tag object and pushing it into a final array
    for (const tag of tags) {
      const result = await db.one(sqlStatement, tag);
      results.push(result);
    }

    return successResponse({ tags: results });
  } catch (e) {
    console.log('/tags/tags.insert ERROR - ', e);
    return badRequestResponse();
  }
};
