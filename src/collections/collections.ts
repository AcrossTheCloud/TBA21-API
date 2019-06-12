import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import { limitQuery } from '../utils/queryHelpers';

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
        COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(collection.geom) as geoJSON
      FROM 
        ${process.env.PGDATABASE}.collections AS collection,
        
        UNNEST(CASE WHEN collection.concept_tags <> '{}' THEN collection.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                  
        UNNEST(CASE WHEN collection.keyword_tags <> '{}' THEN collection.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
          
      WHERE status = true
      
      GROUP BY collection.ID
      ORDER BY collection.ID
      ${`LIMIT ${limitQuery(params.limit, defaultValues.limit)}`}
      ${`OFFSET ${params.offset || defaultValues.offset}`}
    `;

    return successResponse({ collections: await db.query(query) });

  } catch (e) {
    console.log('/collections/get ERROR - ', e);
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
        COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
        COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(collection.geom) as geoJSON
      FROM 
        ${process.env.PGDATABASE}.collections AS collection,
        
        UNNEST(CASE WHEN collection.concept_tags <> '{}' THEN collection.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                  
        UNNEST(CASE WHEN collection.keyword_tags <> '{}' THEN collection.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
          
      WHERE collection.id=${queryString.id} AND status = true
      
      GROUP BY collection.ID
      ORDER BY collection.ID
    `;

    try {
      return successResponse({ collections: await db.query(query) });
    } catch (e) {
      console.log('/collections/collections.getById ERROR - ', e);
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
        COUNT ( collection.ID ) OVER (),
         collection.*,
         COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
         COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(collection.geom) as geoJSON
      FROM 
        ${process.env.PGDATABASE}.collections AS collection,
            
        UNNEST(CASE WHEN collection.concept_tags <> '{}' THEN collection.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.PGDATABASE}.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
                
        UNNEST(CASE WHEN collection.keyword_tags <> '{}' THEN collection.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.PGDATABASE}.keyword_tags AS keyword_tag ON keyword_tag.ID = keyword_tagid
          
        WHERE (
            concept_tag.tag_name LIKE ('%${queryString.tag}%')
            OR
            keyword_tag.tag_name LIKE ('%${queryString.tag}%')
        )
        AND status = true
          
      GROUP BY collection.ID
      ORDER BY collection.ID
      
      ${`LIMIT ${limitQuery(queryString.limit, defaultValues.limit)}`}  
      ${`OFFSET ${queryString.offset || defaultValues.offset}`}
    `;

    try {
      return successResponse({ collections: await db.query(query) });
    } catch (e) {
      console.log('/collections/collections.getByTag ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};
/**
 *
 * Gets collections with a specific person in them
 *
 * @param event { APIGatewayProxyEvent }, limit and offset (optional, defaults set in api)
 * @param context { APIGatewayProxyResult }
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collection list of the results
 */
export const getByPerson = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    defaultValues = { limit: 15, offset: 0 },
    queryString = event.queryStringParameters; // Use default values if not supplied.
  if (queryString && queryString.hasOwnProperty('person') && queryString.person.length) {
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
          
        WHERE (concat(collections.writers, collections.creators, collections.collaborators, collections.directors, collections.interviewers, collections.interviewees, collections.cast_) LIKE '%${queryString.person}%')
        AND status = true
      GROUP BY collections.ID
      ORDER BY collections.ID
      
      ${`LIMIT ${limitQuery(queryString.limit, defaultValues.limit)}`}  
      ${`OFFSET ${queryString.offset || defaultValues.offset}`}
    `;

    try {
      return successResponse({ collections: await db.query(query) });
    } catch (e) {
      console.log('/collections/collections.getByPerson ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};
/**
 *
 * Changes the status of a collection
 *
 * @param event { APIGatewayProxyEvent }, limit and offset (optional, defaults set in api)
 * @param context { APIGatewayProxyResult }
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collection list of the results
 */
export const changeStatus = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString = event.queryStringParameters; // Use default values if not supplied.
  if (queryString && queryString.hasOwnProperty('status') && (queryString.hasOwnProperty('id'))) {
    const query = `
      UPDATE tba21.collections
      SET status = ${queryString.status}
      WHERE collections.id = ${queryString.id}
    `;

    try {
      return successResponse({ items: await db.query(query) });
    } catch (e) {
      console.log('/collections/collections.changeStatus ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};
/**
 *
 * Get all the collections in a bounding box (map)
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const getCollectionsInBounds = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let
    queryString = event.queryStringParameters; // Use default values if not supplied.
  if (queryString && queryString.lat_sw && queryString.lng_sw && queryString.lat_ne && queryString.lng_ne) {
    const query = `
      SELECT *, ST_AsText(geom) as geoJSON 
      FROM ${process.env.PGDATABASE}.collections
      WHERE geom && ST_MakeEnvelope(${queryString.lat_sw}, ${queryString.lng_sw}, ${queryString.lat_ne},${queryString.lng_ne}, 4326)
    `;
    try {
      return successResponse({ items: await db.query(query) });
    } catch (e) {
      console.log('/collections/collections.getCollectionsOnMap ERROR - ', e);
      return badRequestResponse();
    }
  } else {
    return badRequestResponse() ;
  }
};
