import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import Joi from '@hapi/joi';

import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import { limitQuery } from '../utils/queryHelpers';
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
    if (event.queryStringParameters) {
      await Joi.validate(event.queryStringParameters, Joi.object().keys({
        limit: Joi.number().integer(),
        offset: Joi.number().integer()
      }));
    }
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues, // Use default values if not supplied.
      params = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
        SELECT
          COUNT ( item.s3_key ) OVER (),
          item.*,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsGeoJSON(item.geom) as geoJSON
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
    console.log('/items/items.get ERROR - ', !e.isJoi ? e : e.details);
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
export const getItem = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
                          s3Key: Joi.string(),
                          id: Joi.string()
                        })));

    const queryString = event.queryStringParameters; // Use default values if not supplied.

    let
      column = 's3_key',
      params = [queryString.s3Key];

    // If we've passed in id instead of s3key, change the column and params to use id
    if (queryString.hasOwnProperty('id')) {
      column = 'id';
      params = [queryString.id];
    }

    const
      query = `
        SELECT
          item.*,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsGeoJSON(item.geom) as geoJSON 
        FROM 
          ${process.env.ITEMS_TABLE} AS item,
            
          UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                    
          UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        
        WHERE item.${column}=$1
        AND status = true
        GROUP BY item.s3_key
      `;

    return successResponse({ item: await db.oneOrNone(query, params) });
  } catch (e) {
    console.log('admin/items/items.getById ERROR - ', !e.isJoi ? e : e.details);
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
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      tag: Joi.string().required()
    }));

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.tag, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
      SELECT
        COUNT ( item.s3_key ) OVER (),
         item.*,
         COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(item.geom) as geoJSON
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
    console.log('/items/items.getByTag ERROR - ', !e.isJoi ? e : e.details);
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
        items.*,
        COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
        COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
        ST_AsGeoJSON(items.geom) as geoJSON
        
        FROM ${process.env.ITEMS_TABLE},
        
        UNNEST(CASE WHEN items.concept_tags <> '{}' THEN items.concept_tags ELSE '{null}' END) AS concept_tagid
        LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
        
        UNNEST(CASE WHEN items.keyword_tags <> '{}' THEN items.keyword_tags ELSE '{null}' END) AS keyword_tagid
        LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        
        WHERE items.item_type::varchar = $1 
        AND status=true
        
        GROUP BY items.s3_key
        ORDER BY items.s3_key
  
        LIMIT $2
        OFFSET $3
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/items/items.getByType ERROR - ', !e.isJoi ? e : e.details);
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
           COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
           ST_AsGeoJSON(item.geom) as geoJSON 
        FROM 
          ${process.env.ITEMS_TABLE} AS item,

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
    console.log('/items/items.getByPerson ERROR - ', !e.isJoi ? e : e.details);
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
    console.log('/items/items.changeStatus ERROR - ', !e.isJoi ? e : e.details);
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
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      lat_sw: Joi.number().required(),
      lat_ne: Joi.number().required(),
      lng_sw: Joi.number().required(),
      lng_ne: Joi.number().required()
    }));
    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.lat_sw, queryString.lng_sw, queryString.lat_ne, queryString.lng_ne],
      query = `
        SELECT *, ST_AsText(geom) as geoJSON 
        FROM ${process.env.ITEMS_TABLE}
        WHERE geom && ST_MakeEnvelope($1, $2, $3,$4, 4326)
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/items/items.getItemsOnMap ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }

};
/**
 *
 * Gets an items Rekognition tags
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } Array of tags
 */
export const getRekognitionTags = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      s3key: Joi.string().required(),
      confidence: Joi.number().integer(),
    }));

    const
      params = [event.queryStringParameters.s3key],
      confidenceLevel = event.queryStringParameters.confidence ? event.queryStringParameters.confidence : 70,
      query = `
        SELECT machine_recognition_tags as tags
        FROM ${process.env.ITEMS_TABLE}
        WHERE s3_key = $1
      `,
      result: any = await db.oneOrNone(query, params); // tslint:disable-line no-any

    let tags = [];

    // If we have no result at all, the item doesn't exist.
    if (result && result.tags && result.tags.rekognition_labels) {
      // Have tags, filter and map to an array
      tags = result.tags.rekognition_labels.filter( c => c.Confidence >= confidenceLevel).map( n => n.Name);
    }

    return successResponse({ tags: tags});

  } catch (e) {
    console.log('/items/items.getRekognitionTags ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 *  Returns items and collections between two dates(the date passed in and now()) in random order.
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } Array of tags
 */
export const getHomePageItem = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
        itemsLimit: Joi.number().integer(),
        collectionsLimit: Joi.number().integer(),
        date: Joi.date().raw().required(),
      })
    ));

    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      defaultValues = { itemsLimit: 50 },
      params = [limitQuery(queryString.itemsLimit, defaultValues.itemsLimit), queryString.date],
      itemsQuery = `
        SELECT id, title, s3_key, item_subtype
        FROM ${process.env.ITEMS_TABLE}
        WHERE created_at >= $2::date
          AND created_at <= now()
          AND status = true
        ORDER BY random()
        LIMIT $1
      `;

    // if we dont get a limit for collections, set it to 5
    if (queryString.hasOwnProperty('collectionsLimit')) {
        params.push(queryString.collectionsLimit);
      } else { params.push(5); }
    const collectionsQuery = `

        SELECT id, title, type, COUNT(*)
        FROM ${process.env.COLLECTIONS_TABLE}
          INNER JOIN ${process.env.COLLECTIONS_ITEMS_TABLE} ON collections.id = collections_items.collection_id
        WHERE created_at >= $2::date
          AND created_at <=  now()
          AND status = true
        GROUP BY id, title, type
        ORDER BY random()
        LIMIT $3
      `;

    return successResponse({
     items: await db.any(itemsQuery, params),
     collections: await db.any(collectionsQuery, params)
    });
  } catch (e) {
    console.log('/items/items.getItemsOnMap ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }

};