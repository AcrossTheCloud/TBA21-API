import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { limitQuery } from '../utils/queryHelpers';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

/**
 *
 *  Returns items and collections between a given date and now or an oa highlight between a given date
 *  and now if oa_highlight is true. Everything is returned in random order.
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
      date: Joi.date().raw().required(),
      id: Joi.array().items(Joi.number().integer()),
      oa_highlight: Joi.boolean().required()
    }));

    const
      queryString = event.queryStringParameters,
      params = [limitQuery(queryString.itemsLimit, 50), limitQuery(queryString.oaHighlightLimit, 5), limitQuery(queryString.collectionsLimit, 50), queryString.date];
    let
      itemsQuery,
      collectionsQuery,
      oaHighlightQuery;

    if (queryString.oa_highlight && queryString.oa_highlight.includes('true')) {

      oaHighlightQuery = `
        SELECT id, title, s3_key, item_subtype as type, created_at as date
        FROM tba21.${process.env.ITEMS_TABLE}
        WHERE created_at >= $4::date
          AND created_at <= now()
          AND status = true
          AND oa_highlight = true
        ORDER BY random()
        LIMIT $2
    `;
      return successResponse({
         oa_highlight: await db.any(oaHighlightQuery, params)
       });
    } else {
      let whereStatement = '';
      if (eventParams.hasOwnProperty('id') && eventParams.id.length) {
        whereStatement = eventParams.id.map( id => `AND id <> ${id}`).toString().replace(/,/g, ' ');
      }
      params.push(whereStatement);
      itemsQuery = `
        SELECT id, title, s3_key, item_subtype as type, created_at as date
        FROM ${process.env.ITEMS_TABLE}
        WHERE created_at >= $4::date
          AND created_at <= now()
          AND status = true
          AND oa_highlight IS NOT TRUE
          $5:raw
        ORDER BY random()
        LIMIT $1
      `;

      collectionsQuery = `
      SELECT COUNT(*), 
        ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id as id, 
        ${process.env.COLLECTIONS_TABLE}.type, 
        ${process.env.COLLECTIONS_TABLE}.created_at as date, 
        COALESCE(json_agg(DISTINCT ${process.env.ITEMS_TABLE}.s3_key) FILTER (WHERE s3_key IS NOT NULL), '[]') AS s3_key
      FROM tba21.${process.env.COLLECTIONS_TABLE}
        INNER JOIN tba21.${process.env.COLLECTIONS_ITEMS_TABLE} ON ${process.env.COLLECTIONS_TABLE}.id = ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id
        INNER JOIN tba21.${process.env.ITEMS_TABLE} ON ${process.env.COLLECTIONS_ITEMS_TABLE}.item_s3_key = ${process.env.ITEMS_TABLE}.s3_key
      WHERE ${process.env.COLLECTIONS_TABLE}.created_at >= $4::date
        AND ${process.env.COLLECTIONS_TABLE}.created_at <=  now()
        AND ${process.env.COLLECTIONS_TABLE}.status = true
      GROUP BY ${process.env.COLLECTIONS_TABLE}.id, ${process.env.COLLECTIONS_ITEMS_TABLE}.collection_id
      ORDER BY random()
      LIMIT $3
      `;
      return successResponse(
        {
          items: await db.any(itemsQuery, params),
          collections: await db.any(collectionsQuery, params)
        });
    }

  } catch (e) {
    console.log('/items/items.homepage ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }

};
