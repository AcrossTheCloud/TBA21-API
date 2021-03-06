import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, internalServerErrorResponse, successResponse } from '../../common';
import Joi from 'joi';
import { update } from '../../items/model';

const AWS = require('aws-sdk');
const sns = new AWS.SNS();
const cloudfront = new AWS.CloudFront();

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

    await Joi.assert(data, Joi.object().keys(
      {
        s3_key: Joi.string().allow('').allow(null).required(),
        status: Joi.boolean(), // -- false=draft, true=public
        concept_tags: Joi.array().items(Joi.number().integer()),
        keyword_tags: Joi.array().items(Joi.number().integer()),
        place: Joi.array().items(Joi.string()),
        regions: Joi.array().items(Joi.string()),
        item_type: Joi.string().allow('').allow(null),
        item_subtype: Joi.string().allow('').allow(null),
        creators: Joi.array().items(Joi.string()),
        directors: Joi.array().items(Joi.string()),
        writers: Joi.array().items(Joi.string()),
        collaborators: Joi.array().items(Joi.string()),
        exhibited_at: Joi.array().items(Joi.string()),
        series: Joi.string().allow('').allow(null),
        DOI: Joi.string().allow('').allow(null),
        edition: Joi.number().integer().allow(''),
        year_produced: Joi.number().integer().allow(''),
        end_year_produced: Joi.string().allow('').allow(null),
        time_produced: Joi.date().raw().allow('').allow(null),
        publisher: Joi.array().items(Joi.string()),
        interviewers: Joi.array().items(Joi.string()),
        interviewees: Joi.array().items(Joi.string()),
        cast_: Joi.array().items(Joi.string()),
        license: Joi.string().allow('').allow(null),
        title: Joi.string().allow('').allow(null),
        subtitle: Joi.string().allow('').allow(null),
        in_title: Joi.string().allow('').allow(null),
        description: Joi.string().allow('').allow(null),
        map_icon: Joi.string().allow('').allow(null),
        focus_arts: Joi.number().integer().allow(''),
        focus_action: Joi.number().integer().allow(''),
        focus_scitech: Joi.number().integer().allow(''),
        article_link: Joi.string().allow('').allow(null),
        translated_from: Joi.string().allow('').allow(null),
        language: Joi.string().allow('').allow(null),

        birth_date: Joi.date().raw().allow(''),
        death_date: Joi.date().raw().allow(''),

        venues: Joi.array().items(Joi.string().allow('').allow(null)),
        screened_at: Joi.string().allow('').allow(null),
        genre: Joi.string().allow('').allow(null),
        news_outlet: Joi.string().allow('').allow(null),
        institution: Joi.string().allow('').allow(null),
        medium: Joi.string().allow('').allow(null),
        dimensions: Joi.string().allow('').allow(null),
        recording_technique: Joi.string().allow('').allow(null),
        original_sound_credit: Joi.string().allow('').allow(null),
        record_label: Joi.string().allow('').allow(null),
        series_name: Joi.string().allow('').allow(null),
        episode_name: Joi.string().allow('').allow(null),
        episode_number: Joi.number().allow(''),
        recording_name: Joi.string().allow('').allow(null),
        speakers: Joi.array().items(Joi.string()),
        performers: Joi.array().items(Joi.string()),
        host: Joi.array().items(Joi.string()),
        host_organisation: Joi.array().items(Joi.string()),
        radio_station: Joi.string().allow('').allow(null),
        other_metadata: Joi.object(),
        item_name: Joi.string().allow('').allow(null),
        original_title: Joi.string().allow('').allow(null),
        related_event: Joi.string().allow('').allow(null),
        volume_in_series: Joi.number().integer(),
        organisation: Joi.array().items(Joi.string()),
        oa_highlight: Joi.boolean(),
        oa_highlight_order: Joi.number().min(1).max(3).allow(null),
        tba21_material: Joi.boolean(),
        oa_original: Joi.boolean(),
        lecturer: Joi.string().allow('').allow(null),
        authors: Joi.array().items(Joi.string().allow('').allow(null)),
        credit: Joi.string().allow('').allow(null),
        copyright_holder: Joi.string().allow('').allow(null),
        copyright_country: Joi.string().allow('').allow(null),
        created_for: Joi.string().allow('').allow(null),
        duration: Joi.number().allow(''),
        interface: Joi.string().allow('').allow(null),
        document_code: Joi.string().allow('').allow(null),
        project: Joi.string().allow('').allow(null),
        journal: Joi.string().allow('').allow(null),
        event_title: Joi.string().allow('').allow(null),
        recording_studio: Joi.string().allow('').allow(null),
        original_text_credit: Joi.string().allow('').allow(null),
        issue: Joi.number().integer().allow(''),
        pages: Joi.number().integer().allow(''),
        city_of_publication: Joi.string().allow('').allow(null),
        disciplinary_field: Joi.string().allow('').allow(null),
        related_project: Joi.string().allow('').allow(null),
        location: Joi.string().allow('').allow(null),
        participants: Joi.array().items(Joi.string()),
        produced_by: Joi.array().items(Joi.string()),
        projection: Joi.string().allow('').allow(null),
        thumbnail_time: Joi.string().pattern(/^\d{1,2}:\d{1,2}:\d{1,2}/),
        isbn: Joi.number().integer().allow(''),
        related_isbn: Joi.number().integer().allow(''),
        edition_uploaded: Joi.number().integer(),
        first_edition_year: Joi.number().integer(),
        editor: Joi.string().allow('').allow(null),
        featured_in: Joi.string().allow('').allow(null),
        volume: Joi.number().allow(''),
        provenance: Joi.array().items(Joi.string()),
        url: Joi.string().allow('').allow(null),

        geojson: Joi.object()

      }));

    const isAdmin: boolean = !!event.path.match(/\/admin\//);
    const userId: string | null = isAdmin ? null : event.requestContext.identity.cognitoAuthenticationProvider.split(':CognitoSignIn:')[1];
    console.log(userId, data.id, data.title, data.geojson);
    if (data.thumbnail_time) {
      const sns_params = {
        Message: JSON.stringify({ 
          's3_key': data.s3_key,
          's3_content_bucket': process.env.S3_BUCKET,
          's3_vod_bucket': process.env.VIDEO_BUCKET,
          'time': data.thumbnail_time
        }),
        TopicArn: process.env.THUMBNAIL_SNS
      };
      await sns.publish(sns_params).promise();
      delete data.thumbnail_time;
      const thumbPrefix = data.s3_key.split('/').slice(0, -1).join('/');
      const thumbName = data.s3_key.split('/').slice(-1)[0].slice(0, 4) + '_thumb.0000001.jpg';
      const invalidationParams = {
        DistributionId: 'E3LCA9UP25RENJ', /* required */
        InvalidationBatch: { /* required */
          CallerReference: String(new Date().valueOf()), /* required */
          Paths: { /* required */
            Quantity: '1', /* required */
            Items: [
              '/' + thumbPrefix + '/thumbnails/' + thumbName
            ]
          }
        }
      };
      await cloudfront.createInvalidation(invalidationParams).promise();
    }
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
