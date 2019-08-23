import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { limitQuery } from '../utils/queryHelpers';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

/**
 *
 *  If a date is given it returns items and collections between the given date and now.
 *
 *  If oa_highlight is true, only items with oa_highlight = true are returned.
 *
 *  If not date is given, only items, collections and oa_highlights from within the past year will be returned.
 *
 *  Everything is returned in random order.
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } Array of tags
 */
export const get = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {

    const ids = event.multiValueQueryStringParameters && event.multiValueQueryStringParameters.hasOwnProperty('id') ? {id: event.multiValueQueryStringParameters.id} : {};
    const eventParams = {
      ...event.queryStringParameters,
      ...ids
    };

    await Joi.validate(eventParams, Joi.object().keys({
      itemsLimit: Joi.number().integer(),
      collectionsLimit: Joi.number().integer(),
      oaHighlightLimit: Joi.number().integer(),
      date: Joi.date().raw(),
      id: Joi.array().items(Joi.number().integer()),
      oa_highlight: Joi.boolean().required()
    }));

    const
      queryString = event.queryStringParameters,
      params = [limitQuery(queryString.itemsLimit, 50), limitQuery(queryString.oaHighlightLimit, 5), limitQuery(queryString.collectionsLimit, 50)];

    let date: string;
    let collectionsDate: string;
    if ( queryString.date && queryString.date.length ) {
      date = `
        WHERE created_at >= '${queryString.date}'::date
        AND created_at <= now() 
      `;
      params.push(date);
    } else {
      date = `
        WHERE created_at >= (now() - INTERVAL '1 year')
      `;
      params.push(date);
    }
    if (queryString.oa_highlight && queryString.oa_highlight === 'true') {

     const oaHighlightQuery = `
        SELECT 
        items.id,
        title,
        s3_key,
        item_subtype as type,
        created_at as date,
        creators,
        COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS concept_tags,
        COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS keyword_tags

        FROM tba21.${process.env.ITEMS_TABLE},
          UNNEST(CASE WHEN items.concept_tags <> '{}' THEN items.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
          
          UNNEST(CASE WHEN items.keyword_tags <> '{}' THEN items.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
          $4:raw
          AND status = true
          AND oa_highlight = true
        GROUP BY items.id, title, s3_key, concept_tag.tag_name, keyword_tag.tag_name
        ORDER BY random()
        LIMIT $2:raw
    `;
     return successResponse({
         oa_highlight: await db.any(oaHighlightQuery, params)
       });
    } else {
      let whereStatement: string = ``;
      if (eventParams.hasOwnProperty('id') && eventParams.id.length) {
        whereStatement = eventParams.id.map( id => `AND id <> ${id}`).toString().replace(/,/g, ' ');
      }
      params.push(whereStatement);
      const itemsQuery = `
        SELECT 
          id,
          title,
          s3_key,
          item_subtype as type,
          created_at as date,
          creators

        FROM ${process.env.ITEMS_TABLE}
          $4:raw
          AND status = true
          AND oa_highlight IS NOT TRUE
          $5:raw
        ORDER BY random()
        LIMIT $1:raw
      `;
      if ( queryString.date && queryString.date.length ) {
          collectionsDate = `
          WHERE ${process.env.COLLECTIONS_TABLE}.created_at >= '${queryString.date}'::date
          AND ${process.env.COLLECTIONS_TABLE}.created_at <= now() 
        `;
          params.push(collectionsDate);
      } else {
          collectionsDate = `
          WHERE ${process.env.COLLECTIONS_TABLE}.created_at >= (now() - INTERVAL '1 year')
        `;
          params.push(collectionsDate);
      }
      const collectionsQuery = `
        SELECT COUNT(*), 
          ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id as id,
          ${process.env.COLLECTIONS_TABLE}.title,
          ${process.env.COLLECTIONS_TABLE}.type, 
          ${process.env.COLLECTIONS_TABLE}.created_at as date, 
          COALESCE(json_agg(DISTINCT ${process.env.COLLECTIONS_ITEMS_TABLE}.item_s3_key)) AS s3_key,
          ${process.env.COLLECTIONS_TABLE}.creators
        FROM tba21.${process.env.COLLECTIONS_TABLE}
          INNER JOIN tba21.${process.env.COLLECTIONS_ITEMS_TABLE} ON ${process.env.COLLECTIONS_TABLE}.id = ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id
          $6:raw
          AND ${process.env.COLLECTIONS_TABLE}.status = true
        GROUP BY ${process.env.COLLECTIONS_TABLE}.id, ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id
        ORDER BY random()
        LIMIT $3:raw
      `;

      // Pulling the s3_key out of the array and returning it in a string
      let collections = await db.any(collectionsQuery, params);
      if (collections.length) {
        collections.map( a => a.s3_key = a.s3_key[0]);
      }

      return successResponse(
        {
          items: await db.any(itemsQuery, params),
          collections: collections
        });
    }

  } catch (e) {
    console.log('/items/items.homepage ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
