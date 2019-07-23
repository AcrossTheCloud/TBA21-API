import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../../common';
import { db } from '../../databaseConnect';
import Joi from '@hapi/joi';

export const get = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      table: Joi.string().valid('profiles', 'collections', 'items').required(),
      id: Joi.number().integer().required()
    }));

    const
      queryString = event.queryStringParameters,
      params = [queryString.table, queryString.id],
      sqlStatement = `
        SELECT *
        FROM ${process.env.SHORT_PATHS}
        JOIN ${queryString.table === 'profiles' ? process.env.PROFILES_TABLE : (queryString.table === 'collections' ? process.env.COLLECTIONS_TABLE : process.env.ITEMS_TABLE)}
        AS id_ on ${process.env.SHORT_PATHS}.id = id_.id
        WHERE ${process.env.SHORT_PATHS}.id= $2 AND id_.id=$2
      `;
    return successResponse({short_path: await db.any(sqlStatement, params)});
  } catch (e) {
    console.log('/profiles/shortPaths.get ERROR - ', e);
    return badRequestResponse();
  }
};
