import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../common';
import { db } from '../databaseConnect';

/**
 * Gets all the items
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 */
export const getItems = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString: { [name: string]: string } | null = event.queryStringParameters,
    QUERY: string = `select COUNT ( id ) OVER ( ), * from ${process.env.DB_NAME}.items items`,
    JOIN: string = `INNER JOIN tba21.s3uploads s3uploads ON (items.s3uploads_sha512 = s3uploads.ID_sha512)`;

  const
    LIMIT: string = (queryString && queryString.hasOwnProperty('limit') && parseInt(queryString.limit, 0) < 50) ? `LIMIT ${queryString.limit}` : 'LIMIT 15',
    OFFSET: string = (queryString && queryString.hasOwnProperty('offset')) ? `OFFSET ${queryString.offset}` : '';

  try {
    return {
      body: JSON.stringify({
         message: await db.query(`${QUERY} ${JOIN} WHERE status=true ${LIMIT} ${OFFSET}`),
       }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('getItems ERROR - ', e);
    return badRequestResponse;
  }
};
/**
 * Gets the item by their id
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 */
export const getItemsById = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString: { [name: string]: string } | null = event.queryStringParameters,
    QUERY: string = `select COUNT ( id ) OVER ( ), * from ${process.env.DB_NAME}.items items`;

  // Default query string params.
  if (queryString && queryString.hasOwnProperty('id')) {
    const
      LIMIT: string = (queryString.hasOwnProperty('limit') && parseInt(queryString.limit, 0) < 50) ? `LIMIT ${queryString.limit}` : 'LIMIT 15',
      OFFSET: string = queryString.hasOwnProperty('offset') ? `OFFSET ${queryString.offset}` : '';

    try {
      return {
        body: JSON.stringify({
           message: await db.query(`${QUERY} WHERE status=true AND id=${queryString.id} ${LIMIT} ${OFFSET}`),
        }),
        statusCode: 200,
      };
    } catch (e) {
      console.log('getItemsById ERROR - ', e);
      return badRequestResponse;
    }
  } else {
    return badRequestResponse ;
  }
};
/**
 * Gets the item by tag id
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 */
export const getItemsByTag = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString: { [name: string]: string } | null = event.queryStringParameters,
    QUERY: string = `select COUNT ( ID ) OVER ( ), * from ${process.env.DB_NAME}.items items`;

  if (queryString) {
    const
      KEYWORD = queryString.hasOwnProperty('keywordTag') ? `AND (keyword_tags::text like ('{%${queryString.keywordTag}%}'))` : '',
      CONCEPT = queryString.hasOwnProperty('conceptTag') ? `AND (concept_tags::text like ('{%${queryString.conceptTag}%}'))` : '';

    const
      LIMIT: string = (queryString.hasOwnProperty('limit') && parseInt(queryString.limit, 0) < 50) ? `LIMIT ${queryString.limit}` : 'LIMIT 15',
      OFFSET: string = queryString.hasOwnProperty('offset') ? `OFFSET ${queryString.offset}` : '';

    try {
      return {
        body: JSON.stringify({
           message: await db.query(`${QUERY} WHERE status=true ${KEYWORD} ${CONCEPT} ${LIMIT} ${OFFSET}`),
         }),
        statusCode: 200,
      };
    } catch (e) {
      console.log('getItems ERROR - ', e);
      return badRequestResponse;
    }

  } else {
    return badRequestResponse;
  }
};
