import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, headers, internalServerErrorResponse } from '../../common';
import { db } from '../../databaseConnect';
import Joi from '@hapi/joi';

/**
 *
 * Insert a new collection
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */

// ID bigserial PRIMARY KEY,
// created_at timestamp with time zone NOT NULL,
// updated_at timestamp with time zone NOT NULL,
// time_produced timestamp with time zone,
// status boolean,
// concept_tags bigint[],
// keyword_tags bigint[],
// place varchar(128),
// country_or_ocean varchar(128),
// creators varchar(256)[],
// contributor uuid,
// directors varchar(256)[],
// writers varchar(256)[],
// collaborators varchar(256),
// exhibited_at varchar(256),
// series varchar(256),
// ISBN numeric(13),
// edition numeric(3),
// publisher varchar(256)[],
// interviewers varchar(256)[],
// interviewees varchar(256)[],
// cast_ varchar(256),
// title varchar(256),
// description varchar(256)

export const createCollection = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        status: Joi.boolean(),
        concept_tags: Joi.array().items(Joi.number().integer()),
        keyword_tags: Joi.array().items(Joi.number().integer()),
        place: Joi.string(),
        country_or_ocean: Joi.string(),
        creators: Joi.array().items(Joi.string()),
        directors: Joi.array().items(Joi.string()),
        writers: Joi.array().items(Joi.string()),
        collaborators: Joi.string(),
        exhibited_at: Joi.string(),
        series: Joi.string(),
        ISBN: Joi.number().integer(),
        edition: Joi.number().integer(),
        publisher: Joi.array().items(Joi.string()),
        interviewers: Joi.array().items(Joi.string()),
        interviewees: Joi.array().items(Joi.string()),
        cast_: Joi.string(),
        title: Joi.string(),
        description: Joi.string(),
        items: Joi.array().items(Joi.string()) // Array of s3 keys to be added to collection
      }));
    // will cause an exception if it is not valid

    let paramCounter = 0;

    const
      params = [],
      sqlFields: string[] = Object.keys(data).filter(e => (e !== 'items')).map((key) => {
        return `${key}`;
      }),
      sqlParams: string[] = Object.keys(data).filter(e => (e !== 'items')).map((key) => {
        params[paramCounter++] = data[key];
        return `$${paramCounter}`;
      });

    sqlFields.push('created_at', 'updated_at');
    sqlParams.push('now()', 'now()');

    const query = `INSERT INTO ${process.env.COLLECTIONS_TABLE} (${[...sqlFields]}) VALUES (${[...sqlParams]}) RETURNING id;`;

    const insertResult = await db.task(async t => {
      const insertedObject = await t.one(query, params);

      // If we have items
      if (data.items && data.items.length > 0) {
        const
          SQL_INSERTS: string[] = data.items.map((item, index) => (`($1, $${index + 2})`)),
          addQuery = `INSERT INTO ${process.env.COLLECTIONS_ITEMS_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`,
          addParams = [insertedObject.id, ...data.items];

        await t.any(addQuery, addParams);
      }

      return insertedObject;
    });

    return {
      body: JSON.stringify({ success: true, id: insertResult.id }),
      headers: headers,
      statusCode: 200
    };

  } catch (e) {
    if ((e.message === 'Nothing to update') || (e.isJoi)) {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/collections/update ERROR - ', e);
      return internalServerErrorResponse();
    }
  }
};
