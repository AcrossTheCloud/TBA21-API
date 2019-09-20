import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse } from '../../common';
import Joi from '@hapi/joi';
import { update } from '../../collections/model';

import { uuidRegex } from '../../utils/uuid';

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
        contributors: Joi.array().items(Joi.string().allow('').allow(null).regex(uuidRegex)),
        regional_focus: Joi.string().allow('').allow(null),
        regions: Joi.array().items(Joi.string().allow('').allow(null)),
        creators: Joi.array().items(Joi.string().allow('').allow(null)),
        directors: Joi.array().items(Joi.string().allow('').allow(null)),
        writers: Joi.array().items(Joi.string().allow('').allow(null)),
        editor: Joi.string().allow('').allow(null),
        collaborators: Joi.array().items(Joi.string().allow('').allow(null)),
        exhibited_at: Joi.array().items(Joi.string().allow('').allow(null)),
        series: Joi.string().allow('').allow(null),
        isbn: Joi.array().items(Joi.number().integer()),
        edition: Joi.number().integer(),
        publisher: Joi.array().items(Joi.string().allow('').allow(null)),
        interviewers: Joi.array().items(Joi.string().allow('').allow(null)),
        interviewees: Joi.array().items(Joi.string().allow('').allow(null)),
        cast_: Joi.array().items(Joi.string().allow('').allow(null)),
        title: Joi.string().allow('').allow(null),
        subtitle: Joi.string().allow('').allow(null),
        description: Joi.string().allow('').allow(null),
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
        pages: Joi.number().integer(),
        journal: Joi.string().allow('').allow(null),
        map_icon: Joi.string().allow('').allow(null),
        participants: Joi.array().items(Joi.string().allow('').allow(null)),
        venues: Joi.array().items(Joi.string().allow('').allow(null)),
        curator: Joi.string().allow('').allow(null),
        host: Joi.array().items(Joi.string().allow('').allow(null)),
        type: Joi.string().allow('').allow(null),
        event_type: Joi.string().allow('').allow(null),
        host_organisation: Joi.array().items(Joi.string().allow('').allow(null)),
        focus_arts: Joi.number().integer(),
        focus_action: Joi.number().integer(),
        focus_scitech: Joi.number().integer(),
        url: Joi.string().allow('').allow(null),
        related_material: Joi.array().items(Joi.number()),
        license: Joi.string().allow('').allow(null),
        location: Joi.string().allow('').allow(null),
        other_metadata: Joi.object(),
        year_produced: Joi.number().integer(),
        media_type: Joi.string().allow('').allow(null),
        city_of_publication: Joi.string().allow('').allow(null),
        digital_only: Joi.boolean(),
        related_event: Joi.string().allow('').allow(null),
        volume: Joi.number().integer(),
        number: Joi.number().integer(),
        items: Joi.array().items(Joi.string().allow('').allow(null)) // Array of s3 keys to be added to collection
      }));

    return (await update(data, true));

  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/collections/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};
