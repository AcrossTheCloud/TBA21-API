import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
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
      query: Joi.string(),
      searchQuery: Joi.array().items(Joi.string()),
      offset: Joi.number().integer(),
      limit: Joi.number().integer(),
      focus_arts: Joi.boolean(),
      focus_action: Joi.boolean(),
      focus_scitech: Joi.boolean()
    }));

    const
      queryString = event.queryStringParameters,
      limit = queryString.limit ? queryString.limit : 50,
      offset = queryString.offset ? queryString.offset : 0,
      params = [limit, offset, ...searchQueries];

    const focusArts: string = queryString.hasOwnProperty('focus_arts') ? ` AND focus_arts = 1`  : ` AND focus_arts <> 1`  ;
    const focusAction: string = queryString.hasOwnProperty('focus_action') ? ` AND focus_action = 1`  : ` AND focus_action <> 1`  ;
    const focusScitech: string = queryString.hasOwnProperty('focus_scitech') ? ` AND focus_scitech = 1`  : ` AND focus_scitech <> 1`  ;

    let itemsWhereStatement = ``;
    let collectionsWhereStatement = ``;
    if (searchQueries && searchQueries.length) {
      for (let i = 2; i < params.length ; i++) {
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
        OFFSET $2
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
          LIMIT $1
          OFFSET $2
        `;

      let
        collections = await db.manyOrNone(collectionsQuery, params),
        collectionsPromise = [];
      if (collections.length) {
        collectionsPromise = collections.map( async c => {
          return new Promise( async resolve => {
            const collectionsItems = await db.manyOrNone('SELECT item_s3_key FROM tba21.collections_items WHERE collection_id = $1 ', [c.id]);
            resolve({...c,  s3_key: collectionsItems.map( i => i.item_s3_key ) });
          });
        });
      }
      return successResponse({
        items: await db.any(itemsQuery, params),
        collections: await Promise.all(collectionsPromise)
                             });
    }

    if (queryString.query && queryString.query.length ) {
      params.push(queryString.query);
      const itemsQuery = `
        SELECT 
        title, original_title, event_title, subtitle, description, institution, news_outlet, regions, 
        location, city_of_publication, featured_in, editor, cast_, lecturer, project, record_label, creators,
        directors, writers, collaborators, authors, publisher, produced_by, participants, interviewees, interviewers,
        speakers, performers, host_organisation, organisation
        FROM ${process.env.ITEMS_TABLE} AS item
        WHERE status = true
          AND
          LOWER(title) LIKE '%' || LOWER($3) || '%' OR
          LOWER(original_title) LIKE '%' || LOWER($3) || '%' OR
          LOWER(event_title) LIKE '%' || LOWER($3) || '%' OR
          LOWER(subtitle) LIKE '%' || LOWER($3) || '%' OR
          LOWER(description) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(institution) LIKE '%' || LOWER($3) || '%' OR
          LOWER(news_outlet) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(regions, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(location) LIKE '%' || LOWER($3) || '%' OR
          LOWER(city_of_publication) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(featured_in) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(editor) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(cast_, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(lecturer) LIKE '%' || LOWER($3) || '%' OR
          LOWER(project) LIKE '%' || LOWER($3) || '%' OR
          LOWER(record_label) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(creators, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(directors, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(writers, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(collaborators, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(authors, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(publisher, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(produced_by, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(participants, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(interviewers, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(interviewees, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(speakers, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(performers, '||')) LIKE '%' || LOWER($3) || '%' OR
      
          LOWER(array_to_string(host_organisation, '||')) LIKE '%' || LOWER($3) || '%' OR
          LOWER(array_to_string(organisation, '||')) LIKE '%' || LOWER($3) || '%' 
         
        GROUP BY item.s3_key
        ORDER BY item.updated_at DESC NULLS LAST
        LIMIT $1
        OFFSET $2
      `;
      const collectionsQuery = `
        SELECT title, subtitle, description, institution, regions, location, city_of_publication, editor, cast_, creators, directors, writers, collaborators, publisher, participants, interviewers, interviewees, host_organisation
        FROM ${process.env.COLLECTIONS_TABLE}
          WHERE ${process.env.COLLECTIONS_TABLE}.status = true
            AND
            LOWER(collections.title) LIKE '%' || LOWER($3) || '%' OR
            LOWER(collections.subtitle) LIKE '%' || LOWER($3) || '%' OR
            LOWER(collections.description) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(collections.institution) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(array_to_string(collections.regions, '||')) LIKE '%' || LOWER($3) || '%' OR
            LOWER(collections.location) LIKE '%' || LOWER($3) || '%' OR
            LOWER(collections.city_of_publication) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(collections.editor) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(array_to_string(collections.cast_, '||')) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(array_to_string(collections.creators, '||')) LIKE '%' || LOWER($3) || '%' OR
            LOWER(array_to_string(collections.directors, '||')) LIKE '%' || LOWER($3) || '%' OR
            LOWER(array_to_string(collections.writers, '||')) LIKE '%' || LOWER($3) || '%' OR
            LOWER(array_to_string(collections.collaborators, '||')) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(array_to_string(collections.publisher, '||')) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(array_to_string(collections.participants, '||')) LIKE '%' || LOWER($3) || '%' OR
            LOWER(array_to_string(collections.interviewers, '||')) LIKE '%' || LOWER($3) || '%' OR
            LOWER(array_to_string(collections.interviewees, '||')) LIKE '%' || LOWER($3) || '%' OR
      
            LOWER(array_to_string(collections.host_organisation, '||')) LIKE '%' || LOWER($3) || '%'
            
          GROUP BY collections.id
          LIMIT $1
          OFFSET $2
        `;

      const
        items = await db.manyOrNone(itemsQuery, params),
        collections = await db.manyOrNone(collectionsQuery, params),
        concat = [...items, ...collections],
        results: {field: string, value: string}[] = [];

      if (concat && concat.length) {
        for (let i = 0; i < concat.length - 1; i++) {
          const obj = Object.entries(concat[i]);

          for (let o = 0; o < obj.length - 1; o++) {
            const res: String = obj[o][1].toString(); // tslint:disable-line no-any
            if (res && ( typeof(res) === 'string' ) && res.toLowerCase().includes(queryString.query.toLowerCase())) {
              results.push({
                 'field': obj[o][0],
                 'value': res.toString()
               }
             );
            }
          }
        }
      }

      return successResponse({
        results: results // .map( (r: {[key: string]: any}) => ({'aa': r[1]}) )
      });
    }

    // If all else fails return a bad response.
    return badRequestResponse();
  } catch (e) {
    console.log('/pages/pages.search ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
