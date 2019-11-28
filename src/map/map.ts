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
export const post = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.assert(data, Joi.object().keys({
      lng_sw: Joi.number().min(-180).max(180).required(),
      lat_sw: Joi.number().min(-90).max(90).required(),
      lng_ne: Joi.number().min(-180).max(180).required(),
      lat_ne: Joi.number().min(-90).max(90).required(),
      type: Joi.string().valid('collection', 'item').required(),
      itemids: Joi.array().items(Joi.number()),
      collectionids: Joi.array().items(Joi.number())
    }));
    const
      {
        lng_sw,
        lat_sw,
        lng_ne,
        lat_ne,
        type,
        itemids,
        collectionids
      } = data, // Use default values if not supplied.
      params = [lng_sw, lat_sw, lng_ne, lat_ne, type];

    // $6
    let hasIds = false;
    if (type === 'item' && itemids && itemids.length) {
      hasIds = true;
      params.push(itemids);
    }
    if (type === 'collection' && collectionids && collectionids.length) {
      hasIds = true;
      params.push(collectionids);
    }

    const
      query = `
        SELECT
          COUNT ( data.id ) OVER (),
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
          data.status = true AND ${hasIds ? `data.id NOT IN(SELECT(UNNEST($6))) AND ` : ''} data.geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
          
        GROUP BY data.id ${type === 'item' ? ', data.s3_key' : ''}
        
      `;

      const result = await db.any(query,params);
      console.log("SQL query: " + query);
      console.log("SQL params:" + JSON.stringify(params));
      console.log("SQL result: " + JSON.stringify(result));

    return successResponse({ data: await dbgeoparse(result, null) });
  } catch (e) {
    console.log('/items/items.getItemsOnMap ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
