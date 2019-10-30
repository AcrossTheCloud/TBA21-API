import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import Joi from '@hapi/joi';

import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import { dbgeoparse } from '../utils/dbgeo';
/**
 *
 * Take four coordinates that make up a square and returns the collections inside of it
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } TopoJSON object with features and their properties
 */
export const get = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      lng_sw: Joi.number().required(),
      lat_sw: Joi.number().required(),
      lng_ne: Joi.number().required(),
      lat_ne: Joi.number().required(),
      type: Joi.string().valid('collection', 'item').required()
    }));
    const
      {
        lng_sw,
        lat_sw,
        lng_ne,
        lat_ne,
        type
      } = event.queryStringParameters, // Use default values if not supplied.

      params = [lng_sw, lat_sw, lng_ne, lat_ne, type],
      query = `
        SELECT 
          data.id,
          ${type === 'item' ? 'data.s3_key,' : ''}
          data.title,
          data.focus_arts,
          data.focus_scitech,
          data.focus_action,
          ST_AsText(data.geom) as geom,
          $5 as metaType,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags
                   
        FROM
          ${type === 'item' ? process.env.ITEMS_TABLE : process.env.COLLECTIONS_TABLE} as data,
          
          UNNEST(CASE WHEN data.concept_tags <> '{}' THEN data.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.id = concept_tagid         
        WHERE 
          data.status = true AND data.geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
          
        GROUP BY data.id ${type === 'item' ? ', data.s3_key' : ''}
      `;
    return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
  } catch (e) {
    console.log('/items/items.getItemsOnMap ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }

};
