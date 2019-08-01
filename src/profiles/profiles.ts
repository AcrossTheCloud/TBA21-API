import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';
import { badRequestResponse, headers, internalServerErrorResponse, successResponse } from '../common';

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await Joi.validate(event.queryStringParameters, Joi.object().keys(
      {
        id: Joi.number().integer().required()
      }));

    const
      queryString = event.queryStringParameters,
      params = [queryString.id],
      sqlStatement = `
        SELECT * 
        FROM ${process.env.PROFILES_TABLE}
        WHERE id = $1
      `;

    return successResponse({ profile: await db.any(sqlStatement, params) });
  } catch (e) {
    console.log('/profile/profile.get ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

export const insert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        profile_image: Joi.string(),
        featured_image: Joi.string(),
        full_name: Joi.string().required(),
        field_expertise: Joi.string(),
        city: Joi.string(),
        country: Joi.string().required(),
        biography: Joi.string(),
        website: Joi.string(),
        social_media: Joi.array().items(Joi.string()),
        public_profile: Joi.boolean().required(),
        affiliation: Joi.string(),
        position: Joi.string(),
        contact_person: Joi.string(),
        contact_position: Joi.string(),
        contact_email: Joi.string().required(),
        profile_type: Joi.any().valid('Individual', 'Collective', 'Institution').required()
      }));
    let paramCounter = 0;

    const
      params = [],
      sqlFields: string[] = Object.keys(data).map((key) => {
        return `${key}`;
      }),
      sqlParams: string[] = Object.keys(data).map((key) => {
        params[paramCounter++] = data[key];
        return `$${paramCounter}`;
      });

    const query = `INSERT INTO ${process.env.PROFILES_TABLE} (${[...sqlFields]}) VALUES (${[...sqlParams]}) RETURNING id;`;

    const insertResult = await db.task(async t => {
      return await t.one(query, params);
    });

    return {
      body: JSON.stringify({ success: true, id: insertResult.id }),
      headers: headers,
      statusCode: 200
    };

  } catch (e) {
    if ((e.message === 'Nothing to insert') || (e.isJoi)) {
      return badRequestResponse(e.message);
    } else {
      console.log('/profiles/profiles/insert ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
export const updateById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const
      data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        profile_image: Joi.string(),
        featured_image: Joi.string(),
        full_name: Joi.string(),
        field_expertise: Joi.string(),
        city: Joi.string(),
        country: Joi.string(),
        biography: Joi.string(),
        website: Joi.string(),
        social_media: Joi.array().items(Joi.string()),
        public_profile: Joi.boolean(),
        affiliation: Joi.string(),
        position: Joi.string(),
        contact_person: Joi.string(),
        contact_position: Joi.string(),
        contact_email: Joi.string(),
        profile_type: Joi.any().valid('Individual', 'Collective', 'Institution')
      }));

    let paramCounter = 0;

    const params = [];
    params[paramCounter++] = data.id;
    const SQL_SETS: string[] = Object.keys(data)
        .map((key) => {
          params[paramCounter++] = data[key];
          return `${key}=$${paramCounter}`;
        }),
      query = `
        UPDATE ${process.env.PROFILES_TABLE}
        SET 
          ${[...SQL_SETS]}
        WHERE id = $1 returning id;
      `;

    if (SQL_SETS.length) {
      await db.task(async t => {
        // If we have items in SQL_SETS do the query.
        await t.one(query, params);
        // If we have items to assign to the collection
        if (data.items && data.items.length) {
          let currentItems = await db.any(`select item_s3_key from ${process.env.PROFILES_TABLE} where collection_id=$1`, [data.id]);
          currentItems = currentItems.map(e => (e.item_s3_key));

          const
            toBeAdded = data.items.filter((e) => (currentItems.indexOf(e) < 0)),
            toBeRemoved = currentItems.filter((e) => (data.items.indexOf(e) < 0));

          if (toBeAdded.length > 0) {
            const
              SQL_INSERTS: string[] = toBeAdded.map((item, index) => {
                return `($1, $${index + 2})`;
              }),
              addQuery = `INSERT INTO ${process.env.PROFILES_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`,
              addParams = [data.id, ...toBeAdded];

            await t.any(addQuery, addParams);
          }

          if (toBeRemoved.length > 0) {
            const
              SQL_REMOVES: string[] = toBeRemoved.map((item, index) => {
                return `$${index + 2}`;
              }),
              removeQuery = `DELETE from ${process.env.PROFILES_TABLE}  where collection_id =$1 and item_s3_key in (${[...SQL_REMOVES]})`,
              removeParams = [data.id, ...toBeRemoved];

            await t.any(removeQuery, removeParams);
          }
        }
      });

      return {
        body: 'true',
        headers: headers,
        statusCode: 200
      };
    } else {
      throw new Error('Nothing to update');
    }

  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/profile/profiles/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};
