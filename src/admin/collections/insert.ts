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
  // series_start_date date,
  // series_end_date date,
  // event_start_date date,
  // event_end_date date,
  // expedition_start_date date,
  // expedition_end_date date,
  // installation_start_date date,
  // installation_end_date date,
  // time_produced timestamp with time zone,
  // status boolean,
  // concept_tags bigint[],
  // keyword_tags bigint[],
  // place varchar(128),
  // regional_focus varchar(128),
  // country_or_ocean varchar(128),
  // creators varchar(256)[],
  // contributors uuid[],
  // directors varchar(256)[],
  // writers varchar(256)[],
  // editor varchar(256),
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
  // subtitle varchar(256),
  // description varchar(256),
  // copyright_holder varchar(256),
  // copyright_country varchar(256),
  // disciplinary_field varchar(256),
  // specialization varchar(256),
  // department varchar(256),
  // expedition_leader varchar(256),
  // institution varchar(256),
  // expedition_vessel varchar(256),
  // expedition_route varchar(256),
  // expedition_blog_link varchar(256),
  // participants varchar(256)[],
  // venue varchar(256),
  // curator varchar(265),
  // host varchar(256)[],
  // event_type varchar(256),
  // host_organization varchar(256),
  // focus_arts numeric(1),
  // focus_action numeric(1),
  // focus_scitech numeric(1),
  // url varchar(256)

export const createCollection = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        created_at: Joi.date().raw(),
        updated_at: Joi.date().raw(),
        series_start_date: Joi.date().raw(),
        series_end_date: Joi.date().raw(),
        event_start_date: Joi.date().raw(),
        event_end_date: Joi.date().raw(),
        expedition_start_date: Joi.date().raw(),
        expedition_end_date: Joi.date().raw(),
        installation_start_date: Joi.date().raw(),
        installation_end_date: Joi.date().raw(),
        time_produced: Joi.date().timestamp(),
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
