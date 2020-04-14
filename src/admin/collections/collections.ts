import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { get as getAllOrById } from '../../collections/model';
import { badRequestResponse, successResponse } from '../../common';
import { db } from '../../databaseConnect';
import { limitQuery } from '../../utils/queryHelpers';
import Joi from '@hapi/joi';
import { uuidRegex } from '../../utils/uuid';
import { dbgeoparse } from '../../utils/dbgeo';

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
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        id: Joi.number().integer(),
        inputQuery: Joi.string(),
        order: Joi.string()
      }));

    const
        isAdmin: boolean = !!event.path.match(/\/admin\//),
        userId: string | null = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1],
        inputQuery = event.queryStringParameters ? event.queryStringParameters.inputQuery : null,
        order = event.queryStringParameters ? event.queryStringParameters.order : null;

    return (await getAllOrById(event.queryStringParameters, isAdmin, userId, inputQuery, order));
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
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a typology object containing the results
 */
export const getById = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys({id:  Joi.number().required()}), { presence: 'required' });

    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.id],
      query = `
        SELECT
          collections.*,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsText(collections.geom) as geom
        FROM 
          ${process.env.COLLECTIONS_TABLE} AS collections,
            
          UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.id = concept_tagid,
                    
          UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.id = keyword_tagid
        
        WHERE collections.id=$1
        
        GROUP BY collections.id
      `;

    const result = await db.oneOrNone(query, params);
    const data = result ? await dbgeoparse([result], null) : null;

    return successResponse({ data });
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
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a typology object containing the results
 */
export const getByTag = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
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
         ST_AsText(collections.geom) as geom
      FROM 
        ${process.env.COLLECTIONS_TABLE} AS collections,
            
        UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
          LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.id = concept_tagid,
                
        UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
          LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.id = keyword_tagid
      WHERE (
        UNACCENT(concept_tag.tag_name) ILIKE '%' || UNACCENT($1) || '%'
        OR
        UNACCENT(keyword_tag.tag_name) ILIKE '%' || UNACCENT($1) || '%'
      )
      
      GROUP BY collections.id
      ORDER BY collections.id
      
      LIMIT $2  
      OFFSET $3
    `;

    return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
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
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a typology object containing the results
 *
 */
export const getByPerson = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
      await Joi.assert(event.queryStringParameters, Joi.alternatives().try(
        Joi.object().keys({
          limit: Joi.number().integer(),
          offset: Joi.number().integer(),
          person: Joi.string().required()
        }),
        Joi.object().keys({
          limit: Joi.number().integer(),
          offset: Joi.number().integer(),
          uuid: Joi.string().pattern(uuidRegex).required()
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
            UNACCENT(CONCAT(collections.writers, collections.creators, collections.collaborators, collections.directors, collections.interviewers, collections.interviewees, collections.cast_)) 
          )
          ILIKE '%' || UNACCENT($3) || '%' 
        
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
             ST_AsText(collections.geom) as geom
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

      return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
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
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
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
        ORDER BY collections_items.id
        
        LIMIT $2
        OFFSET $3
      `;

    const data = await dbgeoparse(await db.any(query, params), null);
    return successResponse({ data });
  } catch (e) {
    console.log('/admin/collections/collections.getItemsInCollection ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

/**
 *
 * Get a list of collections in a collection
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - an item list of the results
 */
export const getCollectionsInCollection = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
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
          collection.id,
          collection.title,
          collection.creators,
          collection.status,
          ARRAY_AGG(items.item_s3_key) as s3_key
        FROM
          ${process.env.COLLECTION_COLLECTIONS_TABLE} AS collection_collections
          
          INNER JOIN ${process.env.COLLECTIONS_TABLE} AS collection
          ON collection.id = collection_collections.collection_id
          
          INNER JOIN ${process.env.COLLECTIONS_ITEMS_TABLE} AS items
          ON items.collection_ID = collection_collections.collection_id
          
        WHERE collection_collections.id = $1
        GROUP BY collection.id
        
        LIMIT $2
        OFFSET $3
      `;

    const data = await dbgeoparse(await db.any(query, params), null);
    return successResponse({ data });
  } catch (e) {
    console.log('/admin/collections/collections.getCollectionsInCollection ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
