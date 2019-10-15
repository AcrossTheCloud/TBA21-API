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
    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      lng_sw: Joi.number().required(),
      lat_sw: Joi.number().required(),
      lng_ne: Joi.number().required(),
      lat_ne: Joi.number().required(),
      type: Joi.any().valid('collection', 'item').required()
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
          id,
          ${type === 'item' ? 's3_key' : ''}
          title,
          ST_AsText(geom) as geom,
          $5 as metaType
        FROM ${type === 'item' ? process.env.ITEMS_TABLE : process.env.COLLECTIONS_TABLE}
        WHERE status = true AND geom && ST_MakeEnvelope($1, $2, $3,$4, 4326)
      `;
    return successResponse({ data: await dbgeoparse(await db.any(query, params), null) });
  } catch (e) {
    console.log('/items/items.getItemsOnMap ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }

};
