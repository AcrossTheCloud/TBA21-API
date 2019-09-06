import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, internalServerErrorResponse, successResponse } from '../../common';
import Joi from '@hapi/joi';
import { update } from '../../items/model';

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
        regions: Joi.array().items(Joi.string()),
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
        volume: Joi.number(),
        provenance: Joi.array().items(Joi.string()),
        url: Joi.string()
      }));

    const isAdmin: boolean = !!event.path.match(/\/admin\//);
    const userId: string | null = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];

    return (await update(data, isAdmin, userId));
  } catch (e) {
    if ((e.message === 'Nothing to update')) {
      return successResponse(e.message);
    } else {
      console.log('/admin/items/update ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
