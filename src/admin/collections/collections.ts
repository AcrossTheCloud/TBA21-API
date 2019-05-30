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
        COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
        COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags
      FROM 
        tba21.collections AS collection,
        
        UNNEST(CASE WHEN collection.concept_tags <> '{}' THEN collection.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.DB_NAME}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                  
        UNNEST(CASE WHEN collection.keyword_tags <> '{}' THEN collection.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.DB_NAME}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
          
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
