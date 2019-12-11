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

    await Joi.assert(data, Joi.object().keys(
      {
        created_at: Joi.date().raw().allow('').allow(null),
        updated_at: Joi.date().raw().allow('').allow(null),
        start_date: Joi.date().raw().allow('').allow(null),
        end_date: Joi.date().raw().allow('').allow(null),
        time_produced: Joi.date().timestamp().allow('').allow(null),
        status: Joi.boolean(),
        concept_tags: Joi.array().items(Joi.number().integer()).required(),
        keyword_tags: Joi.array().items(Joi.number().integer()),
        regional_focus: Joi.string().allow('').allow(null),
        regions: Joi.array().items(Joi.string()),
        creators: Joi.array().items(Joi.string()),
        directors: Joi.array().items(Joi.string()),
        writers: Joi.array().items(Joi.string()),
        editor: Joi.string().allow('').allow(null),
        collaborators: Joi.array().items(Joi.string()),
        exhibited_at: Joi.array().items(Joi.string()),
        series: Joi.string().allow('').allow(null),
        isbn: Joi.array().items(Joi.number().integer()),
        edition: Joi.number().integer().allow(''),
        publisher: Joi.array().items(Joi.string()),
        interviewers: Joi.array().items(Joi.string()),
        interviewees: Joi.array().items(Joi.string()),
        cast_: Joi.array().items(Joi.string()),
        title: Joi.string().allow('').allow(null).required(),
        subtitle: Joi.string().allow('').allow(null),
        description: Joi.string().allow('').allow(null).required(),
        copyright_holder: Joi.string().allow('').allow(null),
        copyright_country: Joi.string().allow('').allow(null),
        disciplinary_field: Joi.string().allow('').allow(null),
        specialisation: Joi.string().allow('').allow(null),
        department: Joi.string().allow('').allow(null),
        expedition_leader: Joi.string().allow('').allow(null),
        institution: Joi.string().allow('').allow(null),
        expedition_vessel: Joi.string().allow('').allow(null),
        expedition_route: Joi.string().allow('').allow(null),
        expedition_blog_link: Joi.string().allow('').allow(null),
        series_name: Joi.string().allow('').allow(null),
        volume_in_series: Joi.number(),
        pages: Joi.number().integer().allow(''),
        journal: Joi.string().allow('').allow(null),
        map_icon: Joi.string().allow('').allow(null),
        participants: Joi.array().items(Joi.string()),
        venues: Joi.array().items(Joi.string()),
        curator: Joi.string().allow('').allow(null),
        host: Joi.array().items(Joi.string()),
        type: Joi.string().allow('').allow(null).required(),
        event_type: Joi.string().allow('').allow(null),
        host_organisation: Joi.array().items(Joi.string()),
        installation_name: Joi.string().allow('').allow(null),
        focus_arts: Joi.number().integer().allow(''),
        focus_action: Joi.number().integer().allow(''),
        focus_scitech: Joi.number().integer().allow(''),
        url: Joi.string().allow('').allow(null),
        related_material: Joi.array().items(Joi.number()),
        license: Joi.string().allow('').allow(null),
        location: Joi.string().allow('').allow(null),
        other_metadata: Joi.object(),
        year_produced: Joi.number().integer().allow(''),
        media_type: Joi.string().allow('').allow(null),
        city_of_publication: Joi.string().allow('').allow(null),
        digital_only: Joi.boolean(),
        related_event: Joi.string().allow('').allow(null),
        volume: Joi.number().integer().allow(''),
        number: Joi.number().integer().allow(''),
        contributors: Joi.array().items(Joi.string().uuid()),
        items: Joi.array().items(Joi.string()), // Array of s3 keys to be added to collection

        geojson: Joi.object()
      }));

    return (await create(data, (!!event.path.match(/\/admin\//))));

  } catch (e) {
    if ((e.message === 'Nothing to update') || (e.isJoi)) {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/collections/insert ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
