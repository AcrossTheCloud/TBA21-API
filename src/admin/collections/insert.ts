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

export const createCollection = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        created_at: Joi.date().raw(),
        updated_at: Joi.date().raw(),
        start_date: Joi.date().raw().required(),
        end_date: Joi.date().raw(),
        time_produced: Joi.date().timestamp(),
        status: Joi.boolean(),
        concept_tags: Joi.array().items(Joi.number().integer()).required(),
        keyword_tags: Joi.array().items(Joi.number().integer()),
        place: Joi.string().required(),
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
        cast_: Joi.array().items(Joi.string()),
        title: Joi.string().required(),
        subtitle: Joi.string(),
        description: Joi.string().required(),
        copyright_holder: Joi.string(),
        copyright_country: Joi.string(),
        disciplinary_field: Joi.string(),
        specialization: Joi.string(),
        department: Joi.string(),
        expedition_leader: Joi.string(),
        institution: Joi.string().required(),
        expedition_vessel: Joi.string(),
        expedition_route: Joi.string(),
        expedition_blog_link: Joi.string(),
        series_name: Joi.string(),
        volume_in_series: Joi.number(),
        pages: Joi.number().integer(),
        journal: Joi.string(),
        map_icon: Joi.string(),
        participants: Joi.array().items(Joi.string()),
        venue: Joi.string(),
        curator: Joi.string(),
        host: Joi.array().items(Joi.string()),
        type: Joi.string().required(),
        host_organization: Joi.string(),
        focus_arts: Joi.number().integer().required(),
        focus_action: Joi.number().integer().required(),
        focus_scitech: Joi.number().integer().required(),
        url: Joi.string(),
        related_material: Joi.array().items(Joi.number()),
        license: Joi.string(),
        location: Joi.string(),
        other_metadata: Joi.object(),
        year_produced: Joi.number().required(),
        items: Joi.array().items(Joi.string()) // Array of s3 keys to be added to collection
      }));

    if (data.keyword_tags) {
      data.keyword_tags = data.keyword_tags.map( t => parseInt(t, 0));
    }
    if (data.concept_tags) {
      data.concept_tags = data.concept_tags.map( t => parseInt(t, 0));
    }

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
