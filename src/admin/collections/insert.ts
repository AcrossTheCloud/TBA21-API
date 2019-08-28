import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, internalServerErrorResponse } from '../../common';
import Joi from '@hapi/joi';
import { create } from '../../collections/model';

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
        start_date: Joi.date().raw(),
        end_date: Joi.date().raw(),
        time_produced: Joi.date().timestamp(),
        status: Joi.boolean(),
        concept_tags: Joi.array().items(Joi.number().integer()).required(),
        keyword_tags: Joi.array().items(Joi.number().integer()),
        regional_focus: Joi.string(),
        regions: Joi.array().items(Joi.string()),
        creators: Joi.array().items(Joi.string()),
        directors: Joi.array().items(Joi.string()),
        writers: Joi.array().items(Joi.string()),
        editor: Joi.string(),
        collaborators: Joi.array().items(Joi.string()),
        exhibited_at: Joi.array().items(Joi.string()),
        series: Joi.string(),
        isbn: Joi.array().items(Joi.number().integer()),
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
        specialisation: Joi.string(),
        department: Joi.string(),
        expedition_leader: Joi.string(),
        institution: Joi.string(),
        expedition_vessel: Joi.string(),
        expedition_route: Joi.string(),
        expedition_blog_link: Joi.string(),
        series_name: Joi.string(),
        volume_in_series: Joi.number(),
        pages: Joi.number().integer(),
        journal: Joi.string(),
        map_icon: Joi.string(),
        participants: Joi.array().items(Joi.string()),
        venues: Joi.array().items(Joi.string()),
        curator: Joi.string(),
        host: Joi.array().items(Joi.string()),
        type: Joi.string().required(),
        event_type: Joi.string(),
        host_organisation: Joi.array().items(Joi.string()),
        focus_arts: Joi.number().integer(),
        focus_action: Joi.number().integer(),
        focus_scitech: Joi.number().integer(),
        url: Joi.string(),
        related_material: Joi.array().items(Joi.number()),
        license: Joi.string(),
        location: Joi.string(),
        other_metadata: Joi.object(),
        year_produced: Joi.number().integer(),
        media_type: Joi.string(),
        city_of_publication: Joi.string(),
        digital_only: Joi.boolean(),
        related_event: Joi.string(),
        volume: Joi.number().integer(),
        number: Joi.number().integer(),
        contributors: Joi.array().items(Joi.string().uuid()),
        items: Joi.array().items(Joi.string()) // Array of s3 keys to be added to collection
      }));

    return (await create(data, (event.path.match(/\/admin\//) ? true : false)));

  } catch (e) {
    if ((e.message === 'Nothing to update') || (e.isJoi)) {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/collections/insert ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
