import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import Joi from '@hapi/joi';

import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import { limitQuery } from '../utils/queryHelpers';
import { uuidRegex } from '../utils/uuid';
import { getAll, getItemBy } from './model';

/**
 *
 * Gets all the items
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } TopoJSON object with data:{ objects.output.geometries[geometries[{'type',  coordinates[]}], properties{}] } geometries contains the geom type and the long, lat and z axis.  Properties contains all the results for the item
 */
export const get = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    let uuid = undefined;

    if (event.queryStringParameters) {
      await Joi.assert(event.queryStringParameters, Joi.object().keys({
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        uuid: Joi.string().pattern(uuidRegex)
      }));

      if (event.queryStringParameters.hasOwnProperty('uuid')) {
        uuid = event.queryStringParameters.uuid;
      }
    }

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues;

    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, false, undefined, undefined, !!uuid ? uuid : undefined));

  } catch (e) {
    console.log('/items/items.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Gets the item by its id
 *
 * @param event {APIGatewayEvent}
 * @param context {Promise<APIGatewayProxyResult>}
 *
 * @returns { Promise<APIGatewayProxyResult> } TopoJSON object with data:{ objects.output.geometries[geometries[{'type',  coordinates[]}], properties{}] } geometries contains the geom type and the long, lat and z axis.  Properties contains all the results for the item
 */
export const getItem = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
        s3Key: Joi.string(),
        id: Joi.string()
      })));

    const queryString = event.queryStringParameters; // Use default values if not supplied.

    let
      column = 's3_key',
      value = queryString.s3Key;

    // If we've passed in id instead of s3key, change the column and params to use id
    if (queryString.hasOwnProperty('id')) {
      column = 'id';
      value = queryString.id;
    }

    return (await getItemBy(column, value));
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
 * @returns { Promise<APIGatewayProxyResult> } TopoJSON object with data:{ objects.output.geometries[geometries[{'type',  coordinates[]}], properties{}] } geometries contains the geom type and the long, lat and z axis.  Properties contains all the results for the item
 */
export const getByTag = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      tag: Joi.string().required()
    }));

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters;

    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, false, null, 'tag', queryString.tag));

  } catch (e) {
    console.log('/items/items.getByTag ERROR - ', !e.isJoi ? e : e.details);
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
 * @returns { Promise<APIGatewayProxyResult> } TopoJSON object with data:{ objects.output.geometries[geometries[{'type',  coordinates[]}], properties{}] } geometries contains the geom type and the long, lat and z axis.  Properties contains all the results for the item
 */
export const getByType = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      type: Joi.string().required()
    }));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters;

    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, false, null, 'type', queryString.type));

  } catch (e) {
    console.log('/items/items.getByType ERROR - ', !e.isJoi ? e : e.details);
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
 * @returns { Promise<APIGatewayProxyResult> } TopoJSON object with data:{ objects.output.geometries[geometries[{'type',  coordinates[]}], properties{}] } geometries contains the geom type and the long, lat and z axis.  Properties contains all the results for the item
 *
 */
export const getByPerson = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      person: Joi.string().required()
    }));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters;

    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, false, null, 'person', queryString.person));

  } catch (e) {
    console.log('/items/items.getByPerson ERROR - ', !e.isJoi ? e : e.details);
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
 * @returns { Promise<APIGatewayProxyResult> } TopoJSON object with data:{ objects.output.geometries[geometries[{'type',  coordinates[]}], properties{}] } geometries contains the geom type and the long, lat and z axis.  Properties contains all the results for the item
 */
export const changeStatus = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      s3Key: Joi.string().required(),
      status: Joi.boolean().required()
    }));
    const
      queryString = event.queryStringParameters, // Use default values if not supplied.
      params = [queryString.status, queryString.s3Key],
      query = `
        UPDATE ${process.env.ITEMS_TABLE}
        SET status = $1 
        WHERE s3_key = $2 
        RETURNING s3_key,status
      `;

    return successResponse({ updatedItem: await db.one(query, params) });
  } catch (e) {
    console.log('/items/items.changeStatus ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
/**
 *
 * Gets an items Rekognition tags
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } tags:{ tags[] }
 */
export const getRekognitionTags = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.object().keys({
      s3key: Joi.string().required(),
      confidence: Joi.number().integer(),
    }));

    const
      params = [event.queryStringParameters.s3key],
      confidenceLevel = event.queryStringParameters.confidence ? event.queryStringParameters.confidence : 70,
      query = `
        SELECT machine_recognition_tags as tags
        FROM ${process.env.ITEMS_TABLE}
        WHERE s3_key = $1
      `,
      result: any = await db.oneOrNone(query, params); // tslint:disable-line no-any

    let tags = [];

    // If we have no result at all, the item doesn't exist.
    if (result && result.tags && result.tags.rekognition_labels) {
      // If we  have tags, filter and map them to an array
      tags = result.tags.rekognition_labels.filter(c => c.Confidence >= confidenceLevel).map(n => n.Name);
    }

    return successResponse({ tags: tags });

  } catch (e) {
    console.log('/items/items.getRekognitionTags ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
