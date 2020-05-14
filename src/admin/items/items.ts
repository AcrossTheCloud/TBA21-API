import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import { limitQuery } from '../../utils/queryHelpers';
import Joi from '@hapi/joi';
import { getAll, getItemBy } from '../../items/model';

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
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        inputQuery: Joi.string(),
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        order: Joi.string(),
        byField: Joi.string()
      }));

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters ? event.queryStringParameters : defaultValues,
      inputQuery = event.queryStringParameters ? event.queryStringParameters.inputQuery : null,
      order = event.queryStringParameters ? event.queryStringParameters.order : null,
      byField = event.queryStringParameters ? event.queryStringParameters.byField : null;
    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, true, inputQuery, order, byField));

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
    await Joi.assert(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
        s3Key: Joi.string(),
        id: Joi.string()
      })));

    const queryString = event.queryStringParameters; // Use default values if not supplied.

    let
      column = 's3_key',
      value = queryString.s3Key;

    const isAdmin: boolean = !!event.path.match(/\/admin\//);
    const isContributor: boolean = !!event.path.match(/\/contributor\//);
    const userId: string | null = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    // If we've passed in id instead of s3key, change the column and params to use id
    if (queryString.hasOwnProperty('id')) {
      column = 'id';
      value = queryString.id;
    }

    return (await getItemBy(column, value, isAdmin, isContributor, userId));

  } catch (e) {
    console.log('admin/items/items.getItem ERROR - ', !e.isJoi ? e : e.details);
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
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        tag: Joi.string().required(),
        order: Joi.string()
      }));

    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters,
      order = event.queryStringParameters ? event.queryStringParameters.order : null;

    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, true, null, order, 'tag', queryString.tag));

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
export const getAllMine = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.assert(event.queryStringParameters, Joi.alternatives().try(
      Joi.object().keys({
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        inputQuery: Joi.string(),
        order: Joi.string(),
        byField : Joi.string()
      })
    ));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters,
      userId = event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1],
      inputQuery = event.queryStringParameters ? event.queryStringParameters.inputQuery : null,
      order = event.queryStringParameters.order ? event.queryStringParameters.order : null,
      byField = event.queryStringParameters.byField ? event.queryStringParameters.byField : null;

    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, true, inputQuery, order, byField, null, userId));

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
    await Joi.assert(event.queryStringParameters, Joi.object().keys(
      {
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
        type: Joi.string().required()
      }));
    const
      defaultValues = { limit: 15, offset: 0 },
      queryString = event.queryStringParameters,
      order = event.queryStringParameters ? event.queryStringParameters.order : null;

    return (await getAll(limitQuery(queryString.limit, defaultValues.limit), queryString.offset || defaultValues.offset, true, null, order, 'type', queryString.type));

  } catch (e) {
    console.log('admin/items/items.getByType ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
