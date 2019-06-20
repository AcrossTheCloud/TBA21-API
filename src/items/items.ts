import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import { limitQuery } from '../utils/queryHelpers';
import Joi from '@hapi/joi';
/**
 *
 * Gets all the items
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const get = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer()
    }));
    // will cause an exception if it is not valid
    console.log(result); // to see the result

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues, // Use default values if not supplied.
      params = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
        SELECT
          COUNT ( item.s3_key ) OVER (),
          item.*,
          COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsGeoJSON(item.location) as geoJSON
        FROM 
          ${process.env.ITEMS_TABLE} AS item,
            
          UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                    
          UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
            
        WHERE status=true
        
        GROUP BY item.s3_key
        ORDER BY item.s3_key
        
        LIMIT $1 
        OFFSET $2 
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/items/items.get ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Gets the item by their id
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const getBys3Key = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({s3Key:  Joi.string().required()}), { presence: 'required' });
    // will cause an exception if it is not valid
    console.log(result); // to see the result

    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.s3Key],
      query = `
        SELECT
          item.*,
          COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsGeoJSON(item.location) as geoJSON 
        FROM 
          ${process.env.ITEMS_TABLE} AS item,
            
          UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                    
          UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        
        WHERE status=true AND item.s3_key=$1
        
        GROUP BY item.s3_key
        ORDER BY item.s3_key
      `;

    return successResponse({ items: await db.oneOrNone(query, params) });
  } catch (e) {
    console.log('/items/items.getById ERROR - ', e);
    return badRequestResponse();
  }
};

/**
 *
 * Get the item by tag name
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const getByTag = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      tag: Joi.string().required()
    }));
    // will cause an exception if it is not valid
    console.log(result); // to see the result

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.tag, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
      SELECT
        COUNT ( item.s3_key ) OVER (),
         item.*,
         COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
         COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(item.location) as geoJSON
      FROM 
        ${process.env.ITEMS_TABLE} AS item,
            
        UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                
        UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
      WHERE 
        status=true
      AND (
        LOWER(concept_tag.tag_name) LIKE '%' || LOWER($1) || '%'
        OR
        LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($1) || '%'
      )
      
      GROUP BY item.s3_key
      ORDER BY item.s3_key
      
      LIMIT $2  
      OFFSET $3
    `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/items/items.getByTag ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Get a list of items by their type
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const getByType = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      type: Joi.string().required()
    }));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.type, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
        SELECT 
        COUNT ( item.s3_key ) OVER (),
        itemtype.ID,
        item.*,
        COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
        COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
        ST_AsGeoJSON(item.location) as geoJSON
        
        
        FROM ${process.env.TYPES_TABLE} as itemtype
        INNER JOIN ${process.env.ITEMS_TABLE} AS item ON item.item_type=itemtype.id,
        
        UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
        LEFT JOIN tba21.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
        
        UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
        LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        
        WHERE LOWER(type_name) LIKE '%' || LOWER($1) || '%' 
        AND status=true
        
        GROUP BY itemtype.ID, item.s3_key
        ORDER BY item.s3_key
  
        LIMIT $2
        OFFSET $3
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/items/items.getByType ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Get a list of items containing a person
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 *
 */
export const getByPerson = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      person: Joi.string().required()
    }));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.person, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
        SELECT
          COUNT ( item.s3_key ) OVER (),
           item.*,
           COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
           COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
           ST_AsGeoJSON(item.location) as geoJSON 
        FROM 
          ${process.env.ITEMS_TABLE} AS item
            INNER JOIN ${process.env.TYPES_TABLE} AS item_type ON item.item_type = item_type,
                       
          UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                  
          UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        WHERE 
          status=true
        AND ( 
          LOWER(CONCAT(item.writers, item.creators, item.collaborators, item.directors, item.interviewers, item.interviewees, item.cast_)) LIKE '%' || LOWER($1) || '%' 
        )
        
        GROUP BY item.s3_key
        ORDER BY item.s3_key
        
        LIMIT $2 
        OFFSET $3 
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/items/items.getByPerson ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Changes an items status
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const changeStatus = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      s3Key: Joi.string().required(),
      status: Joi.boolean().required()
    }));
    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.status, queryString.s3Key],
        query = `
        UPDATE ${process.env.ITEMS_TABLE}
        SET status = $1 
        WHERE s3_key = $2 
        RETURNING s3_key,status
      `;

    return successResponse({ updatedItem: await db.one(query, params) });
  } catch (e) {
    console.log('/items/items.changeStatus ERROR - ', e);
    return badRequestResponse();
  }
};
/**
 *
 * Get all the items in a bounding box (map)
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const getItemsInBounds = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      lat_sw: Joi.number().required(),
      lat_ne: Joi.number().required(),
      lng_sw: Joi.number().required(),
      lng_ne: Joi.number().required()
    }));
    let
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.lat_sw, queryString.lng_sw, queryString.lat_ne, queryString.lng_ne],
      query = `
        SELECT *, ST_AsText(location) as geoJSON 
        FROM ${process.env.ITEMS_TABLE}
        WHERE location && ST_MakeEnvelope($1, $2, $3,$4, 4326)
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/items/items.getItemsOnMap ERROR - ', e);
    return badRequestResponse();
  }

};
