import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import { limitQuery } from '../utils/queryHelpers';
import Joi from '@hapi/joi';
import { update } from './model';
import { uuidRegex } from '../utils/uuid';
import { dbgeoparse } from '../utils/dbgeo';

/**
 *
 * Gets all the collections
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a typology object containing the results
 */
export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        uuid: Joi.string().pattern(uuidRegex)
      }));

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues,
      params = [limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset];

    let UUIDStatement = '';
    if (event.queryStringParameters && event.queryStringParameters.hasOwnProperty('uuid')) {
      params.push(event.queryStringParameters.uuid);
      UUIDStatement = `AND contributors @> ARRAY[$3]::uuid[]`;
    }

    const
      query = `
        SELECT
          COUNT ( collections.id ) OVER (),
          collections.*,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          COALESCE(array_agg(DISTINCT ${process.env.COLLECTIONS_ITEMS_TABLE}.item_s3_key)) AS s3_key,
          ST_AsText(collections.geom) as geom
        FROM 
          ${process.env.COLLECTIONS_TABLE} AS collections
          
          INNER JOIN ${process.env.COLLECTIONS_ITEMS_TABLE} ON collections.id = ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id
          INNER JOIN ${process.env.ITEMS_TABLE} ON ${process.env.COLLECTIONS_ITEMS_TABLE}.item_s3_key = ${process.env.ITEMS_TABLE}.s3_key,
          
          UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.id = concept_tagid,
                    
          UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.id = keyword_tagid
            
        WHERE collections.status=true
        AND ${process.env.ITEMS_TABLE}.status = true
        ${UUIDStatement}
        
        GROUP BY collections.id
        ORDER BY collections.year_produced
        
        LIMIT $1 
        OFFSET $2 
      `;

    return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
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
    await Joi.assert(event.queryStringParameters, Joi.object().keys({ id: Joi.number().required() }), { presence: 'required' });
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
        
        WHERE status=true AND collections.id=$1
        
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
      WHERE 
        status=true
      AND (
        LOWER(concept_tag.tag_name) LIKE '%' || LOWER($1) || '%'
        OR
        LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($1) || '%'
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
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
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
        WHERE 
          status=true
        AND ( 
          LOWER(CONCAT(collections.writers, collections.creators, collections.collaborators, collections.directors, collections.interviewers, collections.interviewees, collections.cast_)) LIKE '%' || LOWER($1) || '%' 
        )
        
        GROUP BY collections.id
        ORDER BY collections.id
        
        LIMIT $2 
        OFFSET $3 
      `;

    return successResponse({ data: await dbgeoparse(await db.any(query, params), null)});
  } catch (e) {
    console.log('/collections/collections.getByPerson ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Changes a collections status
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */
export const changeStatus = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        id: Joi.string().required(),
        status: Joi.boolean().required()
      }));
    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.status, queryString.id],
      query = `
        UPDATE ${process.env.COLLECTIONS_TABLE}
        SET status = $1 
        WHERE id = $2 
        RETURNING id, status
      `;

    return successResponse({ updatedItem: await db.one(query, params) });
  } catch (e) {
    console.log('/collections/collections.changeStatus ERROR - ', !e.isJoi ? e : e.details);
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
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:items - a typology object containing the results
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
      params = [queryString.id, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
        SELECT
          items.*,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsText(items.geom) as geom 
        FROM
          ${process.env.COLLECTIONS_ITEMS_TABLE} AS collections_items
          INNER JOIN ${process.env.ITEMS_TABLE}
          ON collections_items.item_s3_key = items.s3_key,
          
          UNNEST(CASE WHEN items.concept_tags <> '{}' THEN items.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                  
          UNNEST(CASE WHEN items.keyword_tags <> '{}' THEN items.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        
        WHERE collection_id = $1
          AND status = true
        GROUP BY items.s3_key
        
        LIMIT $2
        OFFSET $3
      `;

    return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
  } catch (e) {
    console.log('/collections/collections.getItemsInCollection ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Get a list of collections in a collection
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a typology object containing the results
 */
export const getCollectionsInCollection = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
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
      params = [queryString.id, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
        SELECT
          collection.*,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
          ST_AsText(collection.geom) as geom 
        FROM
          ${process.env.COLLECTION_COLLECTIONS_TABLE} AS collection_collections
          
          INNER JOIN ${process.env.COLLECTIONS_TABLE} AS collection
          ON collection.id = collection_collections.collection_id,
          
          UNNEST(CASE WHEN collection.concept_tags <> '{}' THEN collection.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                  
          UNNEST(CASE WHEN collection.keyword_tags <> '{}' THEN collection.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        
        WHERE collection_collections.id = $1
          AND status = true
        GROUP BY collection.id
        
        LIMIT $2
        OFFSET $3
      `;

    return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
  } catch (e) {
    console.log('/collections/collections.getCollectionsInCollection ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Returns the collections an item appears in
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - an item list of the results
 */
export const getCollectionsByItem = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        s3Key: Joi.string().required()
      }));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.s3Key, limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset],
      query = `
        SELECT *,
        ST_AsText(collections.geom) as geom
        FROM ${process.env.COLLECTIONS_ITEMS_TABLE}
        INNER JOIN ${process.env.COLLECTIONS_TABLE} on ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id = collections.id
        WHERE item_s3_key = $1
        AND status = 'true'
      `;

    return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
  } catch (e) {
    console.log('/collections/collections.getCollectionsByItem ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

/**
 *
 * Contributor update a collection by it's ID
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */
export const updateById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.assert(data, Joi.object().keys({
      id: Joi.number().integer().required(),
      status: Joi.boolean(),
      start_date: Joi.date().raw().allow('').allow(null),
      end_date: Joi.date().raw().allow('').allow(null),
      concept_tags: Joi.array().items(Joi.number().integer()),
      keyword_tags: Joi.array().items(Joi.number().integer()),
      contributors: Joi.array().items(Joi.string().pattern(uuidRegex)),
      regional_focus: Joi.string().allow('').allow(null),
      regions: Joi.array().items(Joi.string()),
      creators: Joi.array().items(Joi.string()),
      directors: Joi.array().items(Joi.string()),
      writers: Joi.array().items(Joi.string()),
      editor: Joi.string().allow('').allow(null),
      collaborators: Joi.array().items(Joi.string()),
      exhibited_at: Joi.array().items(Joi.string()),
      series: Joi.string().allow('').allow(null),
      isbn: Joi.array().items(Joi.number().integer()),
      edition: Joi.number().integer().allow(''),
      publisher: Joi.array().items(Joi.string()),
      interviewers: Joi.array().items(Joi.string()),
      interviewees: Joi.array().items(Joi.string()),
      cast_: Joi.array().items(Joi.string()),
      title: Joi.string().allow('').allow(null),
      subtitle: Joi.string().allow('').allow(null),
      description: Joi.string().allow('').allow(null),
      copyright_holder: Joi.string().allow('').allow(null),
      copyright_country: Joi.string().allow('').allow(null),
      disciplinary_field: Joi.string().allow('').allow(null),
      specialisation: Joi.string().allow('').allow(null),
      department: Joi.string().allow('').allow(null),
      expedition_leader: Joi.string().allow('').allow(null),
      institution: Joi.string().allow('').allow(null),
      expedition_vessel: Joi.string().allow('').allow(null),
      expedition_route: Joi.string().allow('').allow(null),
      expedition_blog_link: Joi.string().allow('').allow(null),
      series_name: Joi.string().allow('').allow(null),
      volume_in_series: Joi.number().allow(''),
      pages: Joi.number().integer().allow(''),
      journal: Joi.string().allow('').allow(null),
      map_icon: Joi.string().allow('').allow(null),
      participants: Joi.array().items(Joi.string()),
      venues: Joi.array().items(Joi.string()),
      curator: Joi.string().allow('').allow(null),
      host: Joi.array().items(Joi.string()),
      type: Joi.string().allow('').allow(null),
      event_type: Joi.string().allow('').allow(null),
      host_organisation: Joi.array().items(Joi.string()),
      installation_name: Joi.string().allow('').allow(null),
      focus_arts: Joi.number().integer().allow(''),
      focus_action: Joi.number().integer().allow(''),
      focus_scitech: Joi.number().integer().allow(''),
      url: Joi.string().allow('').allow(null),
      related_material: Joi.array().items(Joi.number()),
      license: Joi.string().allow('').allow(null),
      location: Joi.string().allow('').allow(null),
      other_metadata: Joi.object(),
      year_produced: Joi.number().integer().allow(''),
      media_type: Joi.string().allow('').allow(null),
      city_of_publication: Joi.string().allow('').allow(null),
      digital_only: Joi.boolean(),
      related_event: Joi.string().allow('').allow(null),
      volume: Joi.number().integer().allow(''),
      number: Joi.number().integer().allow(''),
      items: Joi.array().items(Joi.string()) // Array of s3 keys to be added to collection
    }));

    const userId = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await update(data, false, userId));

  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/collections/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};
