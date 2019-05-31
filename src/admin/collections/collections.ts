import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
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
        ${process.env.PGDATABASE}.collections AS collection,
        
        UNNEST(CASE WHEN collection.concept_tags <> '{}' THEN collection.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                  
        UNNEST(CASE WHEN collection.keyword_tags <> '{}' THEN collection.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
          
      GROUP BY collection.ID
      ${`LIMIT ${limitQuery(params.limit, defaultValues.limit)}`}
      ${`OFFSET ${params.offset || defaultValues.offset}`}
    `;

    return {
      body: JSON.stringify({ collections: await db.query(query) }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('/admin/collections/get ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Gets collections by their ID from the database
 *
 * @param event { APIGatewayProxyEvent },
 * @param context { APIGatewayProxyResult }
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collection list of the results
 */
export const getById = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString = event.queryStringParameters; // Use default values if not supplied.
  if (queryString && queryString.hasOwnProperty('id') && queryString.id.length) {
    const query = `
      SELECT
        COUNT ( collection.ID ) OVER (),
        collection.*,
        json_agg(concept_tag.*) AS aggregated_concept_tags,
        json_agg(keyword_tag.*) AS aggregated_keyword_tags
      FROM 
        ${process.env.PGDATABASE}.collections AS collection,
            UNNEST(CASE WHEN collection.concept_tags <> '{}' THEN collection.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                  
          UNNEST(CASE WHEN collection.keyword_tags <> '{}' THEN collection.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
      WHERE collection.id=${queryString.id}
      GROUP BY collection.ID
      ORDER BY collection.ID
    `;

    try {
      return {
        body: JSON.stringify({ collections: await db.query(query) }),
        statusCode: 200,
      };
    } catch (e) {
      console.log('/admin/collections/collections.getById ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};
/**
 *
 * Gets collections by their tag from the database
 *
 * @param event { APIGatewayProxyEvent }, limit and offset (optional, defaults set in api)
 * @param context { APIGatewayProxyResult }
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collection list of the results
 */
export const getByTag = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    defaultValues = { limit: 15, offset: 0 },
    queryString = event.queryStringParameters; // Use default values if not supplied.
  if (queryString && queryString.hasOwnProperty('tag') && queryString.tag.length) {
    const query = `
      SELECT
        COUNT ( collections.ID ) OVER (),
         collections.*,
         COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
         COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags
      FROM 
        ${process.env.PGDATABASE}.collections AS collections,
            
        UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                
        UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
        WHERE
         (
            concept_tag.tag_name LIKE ('%${queryString.tag}%')
            OR
            keyword_tag.tag_name LIKE ('%${queryString.tag}%')
          )
      GROUP BY collections.ID
      ORDER BY collections.ID
      ${`LIMIT ${limitQuery(queryString.limit, defaultValues.limit)}`}  
      ${`OFFSET ${queryString.offset || defaultValues.offset}`}
    `;

    try {
      return {
        body: JSON.stringify({collections: await db.query(query) }),
        statusCode: 200,
      };
    } catch (e) {
      console.log('/admin/collections/collections.getByTag ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};
