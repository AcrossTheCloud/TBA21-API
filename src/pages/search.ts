import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { limitQuery } from '../utils/queryHelpers';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

export const get = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {

    const searchQueries = event.multiValueQueryStringParameters && event.multiValueQueryStringParameters.hasOwnProperty('searchQuery') ? {searchQuery: event.multiValueQueryStringParameters.searchQuery} : {};
    const focus = event.multiValueQueryStringParameters && event.multiValueQueryStringParameters.hasOwnProperty('focus') ? {focus: event.multiValueQueryStringParameters.focus} : {};
    const eventParams = {
      ...event.queryStringParameters,
      ...focus,
      ...searchQueries
    };

    await Joi.validate(eventParams, Joi.object().keys({
      searchQuery: Joi.array().items(Joi.string()),
      focus: Joi.string(),
      limit: Joi.number().integer()
    }));

    const
      queryString = event.queryStringParameters,
      params = [limitQuery(queryString.limit, 50), queryString.searchQuery];
    console.log(params, searchQueries);
    if (queryString.searchQuery && queryString.searchQuery.length) {
        const itemsWhereStatement = `
          AND
          LOWER(title) LIKE '%' || LOWER($2) || '%' OR
          LOWER(original_title) LIKE '%' || LOWER($2) || '%' OR
          LOWER(event_title) LIKE '%' || LOWER($2) || '%' OR
          LOWER(subtitle) LIKE '%' || LOWER($2) || '%' OR
          LOWER(description) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(institution) LIKE '%' || LOWER($2) || '%' OR
          LOWER(news_outlet) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(array_to_string(regions, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(location) LIKE '%' || LOWER($2) || '%' OR
          LOWER(city_of_publication) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(featured_in) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(editor) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(array_to_string(cast_, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(lecturer) LIKE '%' || LOWER($2) || '%' OR
          LOWER(project) LIKE '%' || LOWER($2) || '%' OR
          LOWER(record_label) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(array_to_string(creators, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(directors, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(writers, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(collaborators, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(authors, '||')) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(array_to_string(publisher, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(produced_by, '||')) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(array_to_string(participants, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(interviewers, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(interviewees, '||')) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(array_to_string(speakers, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(performers, '||')) LIKE '%' || LOWER($2) || '%' OR
      
          LOWER(array_to_string(host_organisation, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(organisation, '||')) LIKE '%' || LOWER($2) || '%' OR
          
          LOWER(concept_tag.tag_name) LIKE '%' || LOWER($2) || '%' OR
          LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($2) || '%' 
      `;
        
        const collectionsWhereStatement = `
          AND
          LOWER(collections.title) LIKE '%' || LOWER($2) || '%' OR
          LOWER(collections.subtitle) LIKE '%' || LOWER($2) || '%' OR
          LOWER(collections.description) LIKE '%' || LOWER($2) || '%' OR

          LOWER(collections.institution) LIKE '%' || LOWER($2) || '%' OR

          LOWER(array_to_string(collections.regions, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(collections.location) LIKE '%' || LOWER($2) || '%' OR
          LOWER(collections.city_of_publication) LIKE '%' || LOWER($2) || '%' OR

          LOWER(collections.editor) LIKE '%' || LOWER($2) || '%' OR

          LOWER(array_to_string(collections.cast_, '||')) LIKE '%' || LOWER($2) || '%' OR

          LOWER(array_to_string(collections.creators, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(collections.directors, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(collections.writers, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(collections.collaborators, '||')) LIKE '%' || LOWER($2) || '%' OR

          LOWER(array_to_string(collections.publisher, '||')) LIKE '%' || LOWER($2) || '%' OR

          LOWER(array_to_string(collections.participants, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(collections.interviewers, '||')) LIKE '%' || LOWER($2) || '%' OR
          LOWER(array_to_string(collections.interviewees, '||')) LIKE '%' || LOWER($2) || '%' OR

          LOWER(array_to_string(collections.host_organisation, '||')) LIKE '%' || LOWER($2) || '%' OR
          
          LOWER(concept_tag.tag_name) LIKE '%' || LOWER($2) || '%' OR
          LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($2) || '%'
      `;
        const itemsQuery = `
          SELECT
            item.s3_key,
            item.title,
            item.created_at as date,
            item.creators,
            item.item_type as type,
            COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS concept_tags,
            COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS keyword_tags
          FROM ${process.env.ITEMS_TABLE} AS item,
              
            UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
              LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                      
            UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
              LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
          WHERE status = true
          ${itemsWhereStatement}         
              
          GROUP BY item.s3_key
          ORDER BY item.updated_at DESC NULLS LAST
          LIMIT $1
        `;

        const collectionsQuery = `
          SELECT COUNT(*), 
            ${process.env.COLLECTIONS_TABLE}.id,
            ${process.env.COLLECTIONS_TABLE}.title,
            ${process.env.COLLECTIONS_TABLE}.type, 
            ${process.env.COLLECTIONS_TABLE}.created_at as date, 
            ${process.env.COLLECTIONS_TABLE}.creators,
            COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS concept_tags,
            COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS keyword_tags
          FROM ${process.env.COLLECTIONS_TABLE},
            UNNEST(CASE WHEN collections.concept_tags <> '{}' THEN collections.concept_tags ELSE '{null}' END) AS concept_tagid
              LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                      
            UNNEST(CASE WHEN collections.keyword_tags <> '{}' THEN collections.keyword_tags ELSE '{null}' END) AS keyword_tagid
              LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
  
            WHERE ${process.env.COLLECTIONS_TABLE}.status = true
            ${collectionsWhereStatement}
          GROUP BY collections.id
          LIMIT $1:raw
        `;

        // Pulling the s3_key out of the array and returning it in a string
        let collections = await db.any(collectionsQuery, params);

        return successResponse({
          items: await db.any(itemsQuery, params),
          collections: collections,
        });
    } else {
      // message 'please enter a search query' or something
      return successResponse({});
    }

  } catch (e) {
    console.log('/pages/pages.search ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};