import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { limitQuery } from '../utils/queryHelpers';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

export const get = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {

    const searchQueries: string[] = event.multiValueQueryStringParameters && event.multiValueQueryStringParameters.hasOwnProperty('searchQuery') ? event.multiValueQueryStringParameters.searchQuery : [];
    const eventParams = {
      ...event.queryStringParameters,
      searchQuery: searchQueries,
    };

    await Joi.validate(eventParams, Joi.object().keys({
      searchQuery: Joi.array().items(Joi.string()),
      limit: Joi.number().integer(),
      focus_arts: Joi.boolean(),
      focus_action: Joi.boolean(),
      focus_scitech: Joi.boolean()
    }));

    const
      queryString = event.queryStringParameters,
      params = [limitQuery(queryString.limit, 50), ...searchQueries];

    const focusArts: string = queryString.hasOwnProperty('focus_arts') ? ` AND focus_arts = 1`  : ` AND focus_arts <> 1`  ;
    const focusAction: string = queryString.hasOwnProperty('focus_action') ? ` AND focus_action = 1`  : ` AND focus_action <> 1`  ;
    const focusScitech: string = queryString.hasOwnProperty('focus_scitech') ? ` AND focus_scitech = 1`  : ` AND focus_scitech <> 1`  ;

    let itemsWhereStatement = ``;
    let collectionsWhereStatement = ``;
    if (searchQueries && searchQueries.length) {
      for (let i = 1; i < params.length ; i++) {
        const index = i + 1;
        itemsWhereStatement = `
          ${itemsWhereStatement}
          AND
          LOWER(title) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(original_title) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(event_title) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(subtitle) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(description) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(institution) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(news_outlet) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(array_to_string(regions, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(location) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(city_of_publication) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(featured_in) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(editor) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(array_to_string(cast_, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(lecturer) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(project) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(record_label) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(array_to_string(creators, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(directors, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(writers, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(collaborators, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(authors, '||')) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(array_to_string(publisher, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(produced_by, '||')) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(array_to_string(participants, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(interviewers, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(interviewees, '||')) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(array_to_string(speakers, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(performers, '||')) LIKE '%' || LOWER($${index}) || '%' OR
      
          LOWER(array_to_string(host_organisation, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(organisation, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          
          LOWER(concept_tag.tag_name) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($${index}) || '%' 
         `;

        collectionsWhereStatement = `
          ${collectionsWhereStatement}
          AND
          LOWER(collections.title) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(collections.subtitle) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(collections.description) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(collections.institution) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(array_to_string(collections.regions, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(collections.location) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(collections.city_of_publication) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(collections.editor) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(array_to_string(collections.cast_, '||')) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(array_to_string(collections.creators, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(collections.directors, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(collections.writers, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(collections.collaborators, '||')) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(array_to_string(collections.publisher, '||')) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(array_to_string(collections.participants, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(collections.interviewers, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(array_to_string(collections.interviewees, '||')) LIKE '%' || LOWER($${index}) || '%' OR
    
          LOWER(array_to_string(collections.host_organisation, '||')) LIKE '%' || LOWER($${index}) || '%' OR
          
          LOWER(concept_tag.tag_name) LIKE '%' || LOWER($${index}) || '%' OR
          LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($${index}) || '%'
      `;
      }
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
          ${focusArts}
          ${focusAction}
          ${focusScitech}
        GROUP BY item.s3_key
        ORDER BY item.updated_at DESC NULLS LAST
        LIMIT $1
      `;

      const collectionsQuery = `
        SELECT  
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
            ${focusArts}
            ${focusAction}
            ${focusScitech}
          GROUP BY collections.id
          LIMIT $1:raw
        `;

      const response = {
        items: await db.any(itemsQuery, params)
      };

      // Pulling the s3_key out of the array and returning it in a string
      let collections = await db.manyOrNone(collectionsQuery, params);
      if (collections.length) {
        const collectionsPromise = collections.map( async c => {
          return new Promise( async resolve => {
            const collectionsItems = await db.manyOrNone('SELECT item_s3_key FROM tba21.collections_items WHERE collection_id = $1 ', [c.id]);
            resolve({...c,  s3_key: collectionsItems.map( i => i.item_s3_key ) });
          });
        });

        Promise.all(collectionsPromise).then( c => {
          Object.assign(response, { collections: c });
        });

      }
      return successResponse(response);
    } else {
      // focused search
      return badRequestResponse();
    }

  } catch (e) {
    console.log('/pages/pages.search ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};