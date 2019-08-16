import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../../common';
import { db } from '../../databaseConnect';
import { limitQuery } from '../../utils/queryHelpers';
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
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        inputQuery: Joi.string(),
        limit: Joi.number().integer(),
        offset: Joi.number().integer()
      }));

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues, // Use default values if not supplied.
      params = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];

    let searchQuery = '';

    if (event.queryStringParameters && (event.queryStringParameters.inputQuery && event.queryStringParameters.inputQuery.length > 0)) {
      params.push(event.queryStringParameters.inputQuery);
      searchQuery = `
        WHERE 
          LOWER(title) LIKE '%' || LOWER($3) || '%' OR
          LOWER(original_title) LIKE '%' || LOWER($3) || '%' OR
          LOWER(event_title) LIKE '%' || LOWER($3) || '%' OR
          LOWER(subtitle) LIKE '%' || LOWER($3) || '%' OR
          LOWER(description) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(institution) LIKE '%' || LOWER($3) || '%' OR
          LOWER(news_outlet) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(regions, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(location) LIKE '%' || LOWER($3) || '%' OR
          LOWER(city_of_publication) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(featured_in) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(editor) LIKE '%' || LOWER($3) || '%' OR
      
          ISBN::text LIKE '%' || ($3) || '%' OR
          related_ISBN::text LIKE '%' || ($3) || '%' OR
          LOWER(DOI) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(cast_, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(lecturer) LIKE '%' || LOWER($3) || '%' OR
          LOWER(project) LIKE '%' || LOWER($3) || '%' OR
          LOWER(record_label) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(creators, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(directors, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(writers, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(collaborators, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(authors, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(publisher, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(produced_by, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(participants, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(interviewers, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(interviewees, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(speakers, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(performers, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(host_organisation, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(organisation, '||')) LIKE '%' || LOWER($3) || '%' OR
          
          LOWER(concept_tag.tag_name) LIKE '%' || LOWER($3) || '%' OR
          LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($3) || '%' 

      `;
    }

    const
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
            
        ${searchQuery}         
            
        GROUP BY item.s3_key
        ORDER BY item.updated_at DESC NULLS LAST

        LIMIT $1 
        OFFSET $2 
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('admin/items/items.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Gets the item by their id or s3key
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
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
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
      WHERE (
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
    console.log('admin/items/items.getByTag ERROR - ', !e.isJoi ? e : e.details);
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
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
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
        WHERE ( 
          LOWER(CONCAT(item.writers, item.creators, item.collaborators, item.directors, item.interviewers, item.interviewees, item.cast_)) LIKE '%' || LOWER($1) || '%' 
        )
        
        GROUP BY item.s3_key
        ORDER BY item.s3_key
        
        LIMIT $2 
        OFFSET $3 
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('admin/items/items.getByPerson ERROR - ', !e.isJoi ? e : e.details);
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
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
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
        
        GROUP BY items.s3_key
        ORDER BY items.s3_key
  
        LIMIT $2
        OFFSET $3
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('admin/items/items.getByType ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
