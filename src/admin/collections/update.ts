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

export const updateById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const
      data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
        {
          id: Joi.number().integer().required(),
          status: Joi.boolean(),
          concept_tags: Joi.array().items(Joi.number().integer()),
          keyword_tags: Joi.array().items(Joi.number().integer()),
          place: Joi.string(),
          country_or_ocean: Joi.string(),
          creators: Joi.array().items(Joi.string()),
          directors: Joi.array().items(Joi.string()),
          writers: Joi.array().items(Joi.string()),
          editor: Joi.string(),
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
          subtitle: Joi.string(),
          description: Joi.string(),
          copyright_holder: Joi.string(),
          copyright_country: Joi.string(),
          disciplinary_field: Joi.string(),
          specialization: Joi.string(),
          department: Joi.string(),
          expedition_leader: Joi.string(),
          institution: Joi.string(),
          expedition_vessel: Joi.string(),
          expedition_route: Joi.string(),
          expedition_blog_link: Joi.string(),
          participants: Joi.array().items(Joi.string()),
          venue: Joi.string(),
          curator: Joi.string(),
          host: Joi.array().items(Joi.string()),
          event_type: Joi.string(),
          host_organization: Joi.string(),
          focus_arts: Joi.number().integer(),
          focus_action: Joi.number().integer(),
          focus_scitech: Joi.number().integer(),
          url: Joi.string(),
          related_material: Joi.array().items(Joi.string()),
          license: Joi.string(),
          location: Joi.string(),
          other_metadata: Joi.string(),
          items: Joi.array().items(Joi.string())
        }));

    if (data.keyword_tags) {
      data.keyword_tags = data.keyword_tags.map( t => parseInt(t, 0));
    }
    if (data.concept_tags) {
      data.concept_tags = data.concept_tags.map( t => parseInt(t, 0));
    }
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
      }),
      query = `
        UPDATE ${process.env.COLLECTIONS_TABLE}
        SET 
          updated_at='${new Date().toISOString()}',
          ${[...SQL_SETS]}
        WHERE id = $1 returning id;
      `;

    if (SQL_SETS.length) {
      await db.task(async t => {
        // If we have items in SQL_SETS do the query.
        await t.one(query, params);
        // If we have items to assign to the collection
        if (data.items && data.items.length) {
          let currentItems = await db.any(`select item_s3_key from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`, [data.id]);
          currentItems = currentItems.map(e => (e.item_s3_key));

          const
            toBeAdded = data.items.filter((e) => (currentItems.indexOf(e) < 0)),
            toBeRemoved = currentItems.filter((e) => (data.items.indexOf(e) < 0));

          if (toBeAdded.length > 0) {
            const
              SQL_INSERTS: string[] = toBeAdded.map((item, index) => {
                return `($1, $${index + 2})`;
              }),
              addQuery = `INSERT INTO ${process.env.COLLECTIONS_ITEMS_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`,
              addParams = [data.id, ...toBeAdded];

            await t.any(addQuery, addParams);
          }

          if (toBeRemoved.length > 0) {
            const
              SQL_REMOVES: string[] = toBeRemoved.map((item, index) => {
                return `$${index + 2}`;
              }),
              removeQuery = `DELETE from ${process.env.COLLECTIONS_ITEMS_TABLE}  where collection_id =$1 and item_s3_key in (${[...SQL_REMOVES]})`,
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
      console.log('/admin/collections/update ERROR - ', e);
      return badRequestResponse();
    }
  }
};
