import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { get as getAllOrById } from '../../collections/model';
import { badRequestResponse, successResponse } from '../../common';
import { db } from '../../databaseConnect';
import { limitQuery } from '../../utils/queryHelpers';
import Joi from '@hapi/joi';
import { uuidRegex } from '../../utils/uuid';
/**
 *
 * Gets all the collections
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */
export const get = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        id: Joi.number().integer()
      }));

    const isAdmin: boolean = !!event.path.match(/\/admin\//);
    const userId: string | null = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await getAllOrById(event.queryStringParameters, isAdmin, userId));
  } catch (e) {
    console.log('/collections/collections.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Gets the collections by their id
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */
export const getById = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys({id:  Joi.number().required()}), { presence: 'required' });

    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.id],
      query = `
        SELECT
          collections.*,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsGeoJSON(collections.geom) as geoJSON 
        FROM 
          ${process.env.COLLECTIONS_TABLE} AS collections,
            
          UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.id = concept_tagid,
                    
          UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.id = keyword_tagid
        
        WHERE collections.id=$1
        
        GROUP BY collections.id
      `;

    return successResponse({ collection: await db.oneOrNone(query, params) });
  } catch (e) {
    console.log('/collections/collections.getById ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

/**
 *
 * Get the collections by tag name
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
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
        COUNT ( collections.id ) OVER (),
         collections.*,
         COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
         ST_AsGeoJSON(collections.geom) as geoJSON
      FROM 
        ${process.env.COLLECTIONS_TABLE} AS collections,
            
        UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.id = concept_tagid,
                
        UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.id = keyword_tagid
      WHERE (
        LOWER(concept_tag.tag_name) LIKE '%' || LOWER($1) || '%'
        OR
        LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($1) || '%'
      )
      
      GROUP BY collections.id
      ORDER BY collections.id
      
      LIMIT $2  
      OFFSET $3
    `;

    return successResponse({ collections: await db.any(query, params) });
  } catch (e) {
    console.log('/collections/collections.getByTag ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Get a list of collections containing a person
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 *
 */
export const getByPerson = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
      await Joi.validate(event.queryStringParameters, Joi.alternatives().try(
        Joi.object().keys({
          limit: Joi.number().integer(),
          offset: Joi.number().integer(),
          person: Joi.string().required()
        }),
        Joi.object().keys({
          limit: Joi.number().integer(),
          offset: Joi.number().integer(),
          uuid: Joi.string().regex(uuidRegex).required()
          })
      ));
      const
        defaultValues = { limit: 15, offset: 0 },
        queryString = event.queryStringParameters, // Use default values if not supplied.
        params = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];
      let whereStatement;
      if (queryString.person) {
        params.push(queryString.person);
        whereStatement = `
          AND ( 
            LOWER(CONCAT(collections.writers, collections.creators, collections.collaborators, collections.directors, collections.interviewers, collections.interviewees, collections.cast_)) 
          )
          LIKE '%' || LOWER($3) || '%' 
        
        `;
      } else if (queryString.uuid) {
        params.push(queryString.uuid);
        whereStatement = `
         AND contributors @> ARRAY[$3]::uuid[]
        `;
      }
      const query = `
          SELECT
            COUNT ( collections.id ) OVER (),
             collections.*,
             COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
            COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
             ST_AsGeoJSON(collections.geom) as geoJSON 
          FROM 
            ${process.env.COLLECTIONS_TABLE} AS collections,
                         
            UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
              LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.id = concept_tagid,
                    
            UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
              LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.id = keyword_tagid
            WHERE status = true
            ${whereStatement}

          
          GROUP BY collections.id
          ORDER BY collections.id
          
          LIMIT $1
          OFFSET $2
      `;

      return successResponse({ collections: await db.any(query, params) });
  } catch (e) {
    console.log('/collections/collections.getByPerson ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

/**
 *
 * Get a list of items in a collection
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - an item list of the results
 */
export const getItemsInCollection = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        id: Joi.number().required()
      }));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.id, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];
    const query = `
        SELECT
          items.id,
          items.s3_key,
          items.title,
          items.creators,
          items.status,
          items.contributor
        FROM
          ${process.env.COLLECTIONS_ITEMS_TABLE} AS collections_items
          INNER JOIN ${process.env.ITEMS_TABLE}
          ON collections_items.item_s3_key = items.s3_key
        
        WHERE collection_id = $1
        GROUP BY items.s3_key
        
        LIMIT $2
        OFFSET $3
      `;

    return successResponse({ items: await db.any(query, params) });
  } catch (e) {
    console.log('/collections/collections.getItemsInCollection ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
