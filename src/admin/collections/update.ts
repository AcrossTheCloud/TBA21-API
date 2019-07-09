import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, headers } from '../../common';
import { db } from '../../databaseConnect';
import Joi from '@hapi/joi';

/**
 *
 * Update a collection by it's ID
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */

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

export const updateById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(event.body);
    const
      data = JSON.parse(event.body),
      result = await Joi.validate(data, Joi.object().keys(
        {
          id: Joi.number().integer().required(),
          status: Joi.boolean(),
          concept_tags: Joi.array().items(Joi.string()),
          keyword_tags: Joi.array().items(Joi.string()),
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
          items: Joi.array().items(Joi.string())
        }));
    // will cause an exception if it is not valid
    console.log(result); // to see the result

    let paramCounter = 0;

    // NOTE: contributor is inserted on create, uuid from claims
    const params = [];
    params[paramCounter++] = data.id;
    // pushed into from SQL SET map
    // An array of strings [`publish='abc'`, `cast_ = 'the rock'`]
    const SQL_SETS: string[] = Object.keys(data)
      .filter(e => ((e !== 'id') && (e !== 'items'))) // remove id and items
      .map((key) => {
        params[paramCounter++] = data[key];
        return `${key}=$${paramCounter}`;
      });
    let
      query = `
        UPDATE ${process.env.COLLECTIONS_TABLE}
        SET 
          updated_at='${new Date().toISOString()}',
          ${[...SQL_SETS]}
        WHERE id = $1 returning id;
      `;

    console.log(query, params);

    if (SQL_SETS.length) {
      await db.task(async t => {
        // If we have items in SQL_SETS do the query.
        await t.one(query, params);
        // If we have items to assign to the collection
        if (data.items && data.items.length) {
          let currentItems = await db.any(`select item_s3_key from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`, [data.id]);
          currentItems = currentItems.map(e => (e.item_s3_key));
          let toBeAdded = data.items.filter((e) => (currentItems.indexOf(e) < 0));
          let toBeRemoved = currentItems.filter((e) => (data.items.indexOf(e) < 0));
          if (toBeAdded.length > 0) {
            const SQL_INSERTS: string[] = toBeAdded.map((item, index) => {
              return `($1, $${index + 2})`;
            });
            let addQuery = `INSERT INTO ${process.env.COLLECTIONS_ITEMS_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`;
            let addParams = [data.id, ...toBeAdded];
            await t.any(addQuery, addParams);
          }

          if (toBeRemoved.length > 0) {
            const SQL_REMOVES: string[] = toBeRemoved.map((item, index) => {
              return `$${index + 2}`;
            });

            let removeQuery = `DELETE from ${process.env.COLLECTIONS_ITEMS_TABLE}  where collection_id =$1 and item_s3_key in (${[...SQL_REMOVES]})`;
            let removeParams = [data.id, ...toBeRemoved];
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
      console.log('/admin/collections/update ERROR - ', e);
      return badRequestResponse();
    }
  }
};
