import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import Joi from '@hapi/joi';
import { update } from '../../collections/model';

const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i;

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
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys(
      {
        id: Joi.number().integer().required(),
        status: Joi.boolean(),
        start_date: Joi.date().raw(),
        end_date: Joi.date().raw(),
        concept_tags: Joi.array().items(Joi.number().integer()),
        keyword_tags: Joi.array().items(Joi.number().integer()),
        contributors: Joi.array().items(Joi.string().regex(uuidRegex)),
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
        title: Joi.string(),
        subtitle: Joi.string(),
        description: Joi.string(),
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
        type: Joi.string(),
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
        items: Joi.array().items(Joi.string()) // Array of s3 keys to be added to collection
      }));

    return (await update(data));

  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/collections/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};
