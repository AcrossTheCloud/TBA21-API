import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import { db } from '../../databaseConnect';
import { limitQuery } from '../../utils/queryHelpers';

/**
 * Gets all the items
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 */
export const get = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    defaultValues = { limit: 15, offset: 0 },
    queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues; // Use default values if not supplied.

  const query = `
    SELECT
      COUNT ( item.ID ) OVER (),
      item.*,
      json_agg(s3uploads.*) AS s3details,
      json_agg(concept_tag.*) AS aggregated_concept_tags,
      json_agg(keyword_tag.*) AS aggregated_keyword_tags
    FROM 
      ${process.env.PGDATABASE}.items AS item
        INNER JOIN ${process.env.PGDATABASE}.s3uploads AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512,
          UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                
        UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
        LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
    GROUP BY item.ID
    ORDER BY item.ID
    ${`LIMIT ${limitQuery(queryString.limit, defaultValues.limit)}`}  
    ${`OFFSET ${queryString.offset || defaultValues.offset}`}
  `;

  try {
    return {
      body: JSON.stringify({ items: await db.query(query) }),
      statusCode: 200,
    };
  } catch (e) {
    console.log('/items/items.get ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 * Gets the item by their id
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 */
export const getById = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString = event.queryStringParameters; // Use default values if not supplied.
  if (queryString && queryString.hasOwnProperty('id') && queryString.id.length) {
    const query = `
      SELECT
        COUNT ( item.ID ) OVER (),
        item.*,
        json_agg(s3uploads.*) AS s3details,
        json_agg(concept_tag.*) AS aggregated_concept_tags,
        json_agg(keyword_tag.*) AS aggregated_keyword_tags
      FROM 
        ${process.env.PGDATABASE}.items AS item
          INNER JOIN ${process.env.PGDATABASE}.s3uploads AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512,
            UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                  
          UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
      WHERE item.id=${queryString.id}
      GROUP BY item.ID
      ORDER BY item.ID
    `;

    try {
      return {
        body: JSON.stringify({ items: await db.query(query) }),
        statusCode: 200,
      };
    } catch (e) {
      console.log('/items/items.getById ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};

/**
 * Get the item by tag name
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 */
export const getByTag = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    defaultValues = { limit: 15, offset: 0 },
    queryString = event.queryStringParameters; // Use default values if not supplied.
  if (queryString && queryString.hasOwnProperty('tag') && queryString.tag.length) {
    const query = `
      SELECT
        COUNT ( item.ID ) OVER (),
         item.*,
         json_agg(s3uploads.*) AS s3details,
         COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
         COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags
      FROM 
        ${process.env.PGDATABASE}.items AS item
          INNER JOIN ${process.env.PGDATABASE}.s3uploads AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512,
            
        UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                
        UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
      WHERE 
        (
          concept_tag.tag_name LIKE ('%${queryString.tag}%')
          OR
          keyword_tag.tag_name LIKE ('%${queryString.tag}%')
        )
      GROUP BY item.ID
      ORDER BY item.ID
      ${`LIMIT ${limitQuery(queryString.limit, defaultValues.limit)}`}  
      ${`OFFSET ${queryString.offset || defaultValues.offset}`}
    `;

    try {
      return {
        body: JSON.stringify({ items: await db.query(query) }),
        statusCode: 200,
      };
    } catch (e) {
      console.log('/items/items.getByTag ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};
