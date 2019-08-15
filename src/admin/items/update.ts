import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, headers, internalServerErrorResponse, successResponse } from '../../common';
import { db } from '../../databaseConnect';
import Joi from '@hapi/joi';
import { changeS3ProtectionLevel } from '../../utils/AWSHelper';

/**
 *
 * Update an item by its s3_key
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */

export const updateByS3key = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    if (!data.s3_key) {
      return badRequestResponse();
    }

    await Joi.validate(data, Joi.object().keys(
      {
        s3_key: Joi.string().required(),
        status: Joi.boolean(), // -- false=draft, true=public
        concept_tags: Joi.array().items(Joi.number().integer()),
        keyword_tags: Joi.array().items(Joi.number().integer()),
        place: Joi.array().items(Joi.string()),
        country_or_ocean: Joi.string(),
        item_type: Joi.string(),
        item_subtype: Joi.string(),
        creators: Joi.array().items(Joi.string()),
        directors: Joi.array().items(Joi.string()),
        writers: Joi.array().items(Joi.string()),
        collaborators: Joi.array().items(Joi.string()),
        exhibited_at: Joi.array().items(Joi.string()),
        series: Joi.string(),
        ISBN: Joi.number().integer(),
        DOI: Joi.string(),
        edition: Joi.number().integer(),
        year_produced: Joi.number().integer(),
        time_produced: Joi.date().raw(),
        publisher: Joi.array().items(Joi.string()),
        interviewers: Joi.array().items(Joi.string()),
        interviewees: Joi.array().items(Joi.string()),
        cast_: Joi.array().items(Joi.string()),
        license: Joi.string(),
        title: Joi.string(),
        subtitle: Joi.string(),
        in_title: Joi.string(),
        description: Joi.string(),
        map_icon: Joi.string(),
        focus_arts: Joi.number().integer(),
        focus_action: Joi.number().integer(),
        focus_scitech: Joi.number().integer(),
        article_link: Joi.string(),
        translated_from: Joi.string(),
        language: Joi.string(),

        birth_date: Joi.date().raw(),
        death_date: Joi.date().raw(),

        venues: Joi.array().items(Joi.string()),
        screened_at: Joi.string(),
        genre: Joi.string(),
        news_outlet: Joi.string(),
        institution: Joi.string(),
        medium: Joi.string(),
        dimensions: Joi.string(),
        recording_technique: Joi.string(),
        original_sound_credit: Joi.string(),
        record_label: Joi.string(),
        series_name: Joi.string(),
        episode_name: Joi.string(),
        episode_number: Joi.number(),
        recording_name: Joi.string(),
        speakers: Joi.array().items(Joi.string()),
        performers: Joi.array().items(Joi.string()),
        host_organisation: Joi.array().items(Joi.string()),
        radio_station: Joi.string(),
        other_metadata: Joi.object(),
        item_name: Joi.string(),
        original_title: Joi.string(),
        related_event: Joi.string(),
        volume_in_series: Joi.number().integer(),
        organisation: Joi.array().items(Joi.string()),
        oa_highlight: Joi.boolean(),
        tba21_material: Joi.boolean(),
        oa_original: Joi.boolean(),
        lecturer: Joi.string(),
        authors: Joi.array().items(Joi.string()),
        credit: Joi.string(),
        copyright_holder: Joi.string(),
        copyright_country: Joi.string(),
        created_for: Joi.string(),
        duration: Joi.number(),
        interface: Joi.string(),
        document_code: Joi.string(),
        project: Joi.string(),
        journal: Joi.string(),
        event_title: Joi.string(),
        recording_studio: Joi.string(),
        original_text_credit: Joi.string(),
        issue: Joi.number().integer(),
        pages: Joi.number().integer(),
        city_of_publication: Joi.string(),
        disciplinary_field: Joi.string(),
        related_project: Joi.string(),
        location: Joi.string(),
        participants: Joi.array().items(Joi.string()),
        produced_by: Joi.array().items(Joi.string()),
        projection: Joi.string(),
        related_ISBN: Joi.number().integer(),
        edition_uploaded: Joi.number().integer(),
        first_edition_year: Joi.number().integer(),
        editor: Joi.string(),
        featured_in: Joi.string(),
        volume: Joi.number()
      }));

    let message: string = '';
    if (data.hasOwnProperty('status')) {
      // Change the s3 level to Private or Public
      const levelResponse = await changeS3ProtectionLevel(data.s3_key, data.status ? 'public-read' : 'private');
      if (!levelResponse) {
        // If we fail to set the level, console log
        console.log(`Error updating S3 Protection Level for ${data.s3_key}`);

        message = 'Couldn\'t set access level on file, this item has now been unpublished.';
        // and set the level to unpublished.
        data.status = false;
      }
    }

    if (data.keyword_tags) {
      data.keyword_tags = data.keyword_tags.map( t => parseInt(t, 0));
    }
    if (data.concept_tags) {
      data.concept_tags = data.concept_tags.map( t => parseInt(t, 0));
    }

    let paramCounter = 0;

    // NOTE: contributor is inserted on create, uuid from claims
    const params = [];

    params[paramCounter++] = data.s3_key;
    // pushed into from SQL SET map
    // An array of strings [`publish='abc'`, `cast_ = 'the rock'`]
    const SQL_SETS: string[] = Object.keys(data)
      .filter(e => (e !== 's3_key')) // remove s3_key
      .map((key) => {
          params[paramCounter++] = data[key];
          return `${key}=$${paramCounter}`;
      });
    const
      query = `
        UPDATE ${process.env.ITEMS_TABLE}
          SET 
            updated_at='${new Date().toISOString()}',
            ${[...SQL_SETS]}
        WHERE s3_key = $1 returning s3_key, status, id;
      `;

    if (SQL_SETS.length) {
      const result = await db.one(query, params);

      const bodyResponse = {
        success: true,
        updated_key: result.s3_key,
        id: result.id
      };
      // If we have a message, add it to the response.
      if (message.length > 1) {
        Object.assign(bodyResponse, { message : message, success: false });
      }

      return {
        body: JSON.stringify(bodyResponse),
        headers: headers,
        statusCode: 200
      };
    } else {
      throw new Error('Nothing to update');
    }
  } catch (e) {
    if ((e.message === 'Nothing to update')) {
      return successResponse(e.message);
    } else {
      console.log('/admin/items/update ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
