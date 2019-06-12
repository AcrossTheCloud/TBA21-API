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
    //will cause an exception if it is not valid
    console.log(result); // to see the result

    let
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues; // Use default values if not supplied.




    const query = `
    SELECT
      COUNT ( item.ID ) OVER (),
      item.*,
      json_agg(s3uploads.*) AS s3details,
      COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
      COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
      ST_AsGeoJSON(item.location) as geoJSON
    FROM 
      ${process.env.ITEMS_TABLE} AS item
        INNER JOIN ${process.env.UPLOADS_TABLE} AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512,
        
      UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
        LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                
      UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
        LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        
    WHERE status=true
    
    GROUP BY item.ID
    ORDER BY item.ID
    
    LIMIT $1 
    OFFSET $2 
  `;
    let params = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];
    //console.log(query,params);


    let allItems = await db.any(query, params);
    //console.log('lngth', allItems.length);
    return successResponse({ items: allItems });
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
export const getById = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    // VALIDATE first
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({
      id: Joi.number().integer().required()
    }),{ presence: "required" });
    //will cause an exception if it is not valid
    console.log(result); // to see the result 
    let queryString = event.queryStringParameters; // Use default values if not supplied.


    const query = `
      SELECT
        item.*,
        json_agg(s3uploads.*) AS s3details,
        COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
        COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
        ST_AsGeoJSON(item.location) as geoJSON 
      FROM 
        ${process.env.ITEMS_TABLE} AS item
          INNER JOIN ${process.env.UPLOADS_TABLE} AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512,
          
        UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                  
        UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
      
      WHERE status=true AND item.id=$1
      
      GROUP BY item.ID
      ORDER BY item.ID
    `;

    let params = [queryString.id];

    let theItem = await db.oneOrNone(query,params);

    return successResponse({ items: theItem });
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
    //will cause an exception if it is not valid
    console.log(result); // to see the result
    let
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters; // Use default values if not supplied.

    const query = `
      SELECT
        COUNT ( item.ID ) OVER (),
         item.*,
         json_agg(s3uploads.*) AS s3details,
         COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
         COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(item.location) as geoJSON
      FROM 
        ${process.env.ITEMS_TABLE} AS item
          INNER JOIN ${process.env.UPLOADS_TABLE} AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512,
            
        UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                
        UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
      WHERE 
        status=true
      AND (
        concept_tag.tag_name LIKE '%' || $1 || '%'
        OR
        keyword_tag.tag_name LIKE '%' || $1 || '%'
      )
      
      GROUP BY item.ID
      ORDER BY item.ID
      
      LIMIT $2  
      OFFSET $3
    `;
    let params = [queryString.tag, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];
    let allItems = await db.any(query, params)


    return successResponse({ items: allItems });
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
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      type: Joi.string().required()
    }));
  let
    defaultValues = { limit: 15, offset: 0 },
    queryString = event.queryStringParameters; // Use default values if not supplied.

    const query = `
      SELECT 
      COUNT ( item.ID ) OVER (),
      itemtype.ID,
      item.*,
      json_agg(s3uploads.*) AS s3details,
      COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
      COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
      ST_AsGeoJSON(item.location) as geoJSON
      
      
      FROM ${process.env.TYPES_TABLE} as itemtype
      INNER JOIN ${process.env.ITEMS_TABLE} AS item ON item.item_type=itemtype.id
      INNER JOIN ${process.env.UPLOADS_TABLE} AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512,
      
      UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
      LEFT JOIN tba21.concept_tags AS concept_tag ON concept_tag.ID = concept_tagid,
      
      UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
      LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
      
      WHERE type_name LIKE '%' || $1 || '%' 
      AND status=true
      
      GROUP BY itemtype.ID, item.ID
      ORDER BY item.ID

      LIMIT $2
      OFFSET $3
    `;
    let params = [queryString.type, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];
    let allItems = await db.any(query, params)


      return successResponse({ items: allItems });
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
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      person: Joi.string().required()
    }));
  let
    defaultValues = { limit: 15, offset: 0 },
    queryString = event.queryStringParameters; // Use default values if not supplied.
    const query = `
      SELECT
        COUNT ( item.ID ) OVER (),
         item.*,
         json_agg(s3uploads.*) AS s3details,
         COALESCE(json_agg(concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
         COALESCE(json_agg(keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(item.location) as geoJSON 
      FROM 
        ${process.env.ITEMS_TABLE} AS item
          INNER JOIN ${process.env.UPLOADS_TABLE} AS s3uploads ON item.s3uploads_sha512 = s3uploads.ID_sha512
          INNER JOIN ${process.env.TYPES_TABLE} AS item_type ON item.item_type = item_type,
                     
        UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                
        UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
      WHERE 
        status=true
      AND ( 
        CONCAT(item.writers, item.creators, item.collaborators, item.directors, item.interviewers, item.interviewees, item.cast_) LIKE '%' || $1 || '%' 
      )
      
      GROUP BY item.ID
      ORDER BY item.ID
      
      LIMIT $2 
      OFFSET $3 
    `;
    let params = [queryString.person, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];
    let allItems = await db.any(query, params)


      return successResponse({ items: allItems });
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
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({
      id: Joi.number().required(),
      status: Joi.boolean().required()
    }));
  let
    queryString = event.queryStringParameters; // Use default values if not supplied.
    const query = `
      UPDATE ${process.env.ITEMS_TABLE}
      SET status = $1 
      WHERE id = $2 
      RETURNING id,status
    `;
    let params= [queryString.status,queryString.id];
    let itemId = await db.one(query,params);

      return successResponse({ updatedItem: itemId  });
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
    const result = await Joi.validate(event.queryStringParameters, Joi.object().keys({
      lat_sw: Joi.number().required(),
      lat_ne: Joi.number().required(),
      lng_sw: Joi.number().required(),
      lng_ne: Joi.number().required()
    }));
  let
    queryString = event.queryStringParameters; // Use default values if not supplied.

    const query = `
      SELECT *, ST_AsText(location) as geoJSON 
      FROM ${process.env.ITEMS_TABLE}
      WHERE location && ST_MakeEnvelope($1, $2, $3,$4, 4326)
    `;
    let params=[queryString.lat_sw,queryString.lng_sw,queryString.lat_ne,queryString.lng_ne];
    let allItems= await db.any(query,params); 

      return successResponse({ items: allItems});
    } catch (e) {
      console.log('/items/items.getItemsOnMap ERROR - ', e);
      return badRequestResponse();
    }

};
