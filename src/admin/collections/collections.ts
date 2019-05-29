import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import { db } from '../../databaseConnect';
import { limitQuery } from '../../utils/queryHelpers';

/**
 *
 * Gets collections from the database
 *
 * @param event { APIGatewayProxyEvent }, limit and offset (optional, defaults set in api)
 * @param context { APIGatewayProxyResult }
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collection list of the results
 */
export const get = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const
      defaultValues = { limit: 15, offset: 0 },
      params = event.queryStringParameters ? event.queryStringParameters : defaultValues; // Use default values if not supplied.

    const query = `
      SELECT 
        COUNT ( collection.ID ) OVER (),
        collection.*,
        json_agg(tag.*) AS aggregated_concept_tags
      FROM 
        tba21.collections AS collection,
        UNNEST(collection.concept_tags) as tagid
      INNER JOIN 
        tba21.concept_tags AS tag ON tag.ID = tagid
      GROUP BY collection.ID
      ${`LIMIT ${limitQuery(params.limit, defaultValues.limit)}`}
      ${`OFFSET ${params.offset || defaultValues.offset}`}
    `;

    return {
      body: JSON.stringify({
       collections: await db.query(query),
     }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('/collections/get ERROR - ', e);
    return badRequestResponse();
  }
};
