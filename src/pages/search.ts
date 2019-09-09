import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

export const get = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {

    await Joi.validate(event.queryStringParameters, Joi.object().keys({
      query: Joi.string()
    }));

    const
      query = event.queryStringParameters.query,
      params = [query];

    const itemsQuery = `
      SELECT 
      title, original_title, event_title, subtitle, description, institution, news_outlet, regions, 
      location, city_of_publication, featured_in, editor, cast_, lecturer, project, record_label, creators,
      directors, writers, collaborators, authors, publisher, produced_by, participants, interviewees, interviewers,
      speakers, performers, host_organisation, organisation
      FROM ${process.env.ITEMS_TABLE} AS item
      WHERE status = true
        AND (
          LOWER(title) LIKE '%' || LOWER($1) || '%' OR
          LOWER(original_title) LIKE '%' || LOWER($1) || '%' OR
          LOWER(event_title) LIKE '%' || LOWER($1) || '%' OR
          LOWER(subtitle) LIKE '%' || LOWER($1) || '%' OR
          LOWER(description) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(institution) LIKE '%' || LOWER($1) || '%' OR
          LOWER(news_outlet) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(array_to_string(regions, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(location) LIKE '%' || LOWER($1) || '%' OR
          LOWER(city_of_publication) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(featured_in) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(editor) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(array_to_string(cast_, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(lecturer) LIKE '%' || LOWER($1) || '%' OR
          LOWER(project) LIKE '%' || LOWER($1) || '%' OR
          LOWER(record_label) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(array_to_string(creators, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(directors, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(writers, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(collaborators, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(authors, '||')) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(array_to_string(publisher, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(produced_by, '||')) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(array_to_string(participants, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(interviewers, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(interviewees, '||')) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(array_to_string(speakers, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(performers, '||')) LIKE '%' || LOWER($1) || '%' OR
      
          LOWER(array_to_string(host_organisation, '||')) LIKE '%' || LOWER($1) || '%' OR
          LOWER(array_to_string(organisation, '||')) LIKE '%' || LOWER($1) || '%' 
        )
       
      GROUP BY item.s3_key
      ORDER BY item.updated_at DESC NULLS LAST
    `;
    const collectionsQuery = `
      SELECT title, subtitle, description, institution, regions, location, city_of_publication, editor, cast_, creators, directors, writers, collaborators, publisher, participants, interviewers, interviewees, host_organisation
      FROM ${process.env.COLLECTIONS_TABLE}
        WHERE ${process.env.COLLECTIONS_TABLE}.status = true
          AND (
            LOWER(collections.title) LIKE '%' || LOWER($1) || '%' OR
            LOWER(collections.subtitle) LIKE '%' || LOWER($1) || '%' OR
            LOWER(collections.description) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(collections.institution) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(array_to_string(collections.regions, '||')) LIKE '%' || LOWER($1) || '%' OR
            LOWER(collections.location) LIKE '%' || LOWER($1) || '%' OR
            LOWER(collections.city_of_publication) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(collections.editor) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(array_to_string(collections.cast_, '||')) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(array_to_string(collections.creators, '||')) LIKE '%' || LOWER($1) || '%' OR
            LOWER(array_to_string(collections.directors, '||')) LIKE '%' || LOWER($1) || '%' OR
            LOWER(array_to_string(collections.writers, '||')) LIKE '%' || LOWER($1) || '%' OR
            LOWER(array_to_string(collections.collaborators, '||')) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(array_to_string(collections.publisher, '||')) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(array_to_string(collections.participants, '||')) LIKE '%' || LOWER($1) || '%' OR
            LOWER(array_to_string(collections.interviewers, '||')) LIKE '%' || LOWER($1) || '%' OR
            LOWER(array_to_string(collections.interviewees, '||')) LIKE '%' || LOWER($1) || '%' OR
      
            LOWER(array_to_string(collections.host_organisation, '||')) LIKE '%' || LOWER($1) || '%'
          )
          
        GROUP BY collections.id
      `;

    const profilesQuery = `
      SELECT id, full_name, profile_image, country, city, affiliation, profile_type,
      COALESCE(field_expertise, '') as field_expertise
      FROM ${process.env.PROFILES_TABLE}
        WHERE public_profile = true
          AND (
            profile_type = 'Individual' OR
            profile_type = 'Collective' OR
            profile_type = 'Institution'
          )
          AND (
            LOWER(profiles.full_name) LIKE '%' || LOWER($1) || '%' OR
            LOWER(profiles.field_expertise) LIKE '%' || LOWER($1) || '%' OR
            LOWER(profiles.city) LIKE '%' || LOWER($1) || '%' OR
            LOWER(profiles.country) LIKE '%' || LOWER($1) || '%' OR
            LOWER(profiles.affiliation) LIKE '%' || LOWER($1) || '%'
          ) 
        GROUP BY profiles.id
    `;

    const fieldValueLoop = (list: any[], type: string): {field: string, value: string, type: string}[] => { // tslint:disable-line no-any
      const response = [];
      if (list && list.length) {
        for (let i = 0; i < list.length; i++) {
          const obj: any[] = Object.entries(list[i]); // tslint:disable-line no-any
          for (let o = 0; o < obj.length; o++) {
            const res: any | null = obj[o][1]; // tslint:disable-line no-any

            if (res) {
              if (typeof(res) === 'string' && res.toLowerCase().includes(query.toLowerCase())) {
                response.push({
                  'field': obj[o][0],
                  'value': query,
                  'type': type
                });
              } else if (Array.isArray(res) && res.length) {
                for (let j = 0; j < res.length; j++) {
                  if (res[j].toLowerCase().includes(query.toLowerCase())) {
                    response.push({
                     'field': obj[o][0],
                     'value': query,
                     'type': type
                   });
                  }
                }
              }
            }
          }
        }
        return response;
      } else {
        return [];
      }
    };

    const
      items = await db.manyOrNone(itemsQuery, params),
      collections = await db.manyOrNone(collectionsQuery, params),
      profiles = await db.manyOrNone(profilesQuery, params),
      results: {field: string, value: string, type: string}[] = [
        ...fieldValueLoop(items, 'items'),
        ...fieldValueLoop(collections, 'collections'),
        ...fieldValueLoop(profiles, 'profiles')
    ];

    return successResponse({ results: results });
  } catch (e) {
    console.log('/pages/pages.searchSuggestions ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

export const post = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.validate(data, Joi.object().keys({
      criteria: Joi.array().items(
        Joi.object().keys({
          field: Joi.string(),
          value: Joi.string()
        })
      ),
      offset: Joi.number().integer(),
      limit: Joi.number().integer(),
      focus_arts: Joi.boolean(),
      focus_action: Joi.boolean(),
      focus_scitech: Joi.boolean()
    }));

    const
      limit = data.limit ? data.limit : 50,
      offset = data.offset ? data.offset : 0,
      params = [limit, offset];

    const focusArts: string = data.hasOwnProperty('focus_arts') ? ` AND focus_arts = 1`  : ``;
    const focusAction: string = data.hasOwnProperty('focus_action') ? ` AND focus_action = 1`  : ``;
    const focusScitech: string = data.hasOwnProperty('focus_scitech') ? ` AND focus_scitech = 1`  : ``;

    let
      itemsWhereStatement = '',
      collectionsWhereStatement = '',
      profilesWhereStatement = '',
      items = [],
      collections = [],
      profiles = [],
      paramCounter = 2;

    if (data.criteria && data.criteria.length) {

      for (let i = 0; i < data.criteria.length; i++) {
        params.push(data.criteria[i].value);
        paramCounter++;
        itemsWhereStatement = `
          ${itemsWhereStatement}
          AND (
            LOWER(title) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(original_title) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(event_title) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(subtitle) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(description) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(institution) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(news_outlet) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(array_to_string(regions, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(location) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(city_of_publication) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(featured_in) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(editor) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(array_to_string(cast_, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(lecturer) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(project) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(record_label) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(array_to_string(creators, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(directors, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(writers, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(collaborators, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(authors, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(array_to_string(publisher, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(produced_by, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(array_to_string(participants, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(interviewers, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(interviewees, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(array_to_string(speakers, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(performers, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
        
            LOWER(array_to_string(host_organisation, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(organisation, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            
            LOWER(concept_tag.tag_name) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($${paramCounter}) || '%' 
          )
         `;

        collectionsWhereStatement = `
          ${collectionsWhereStatement}
          AND (
            LOWER(collections.title) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(collections.subtitle) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(collections.description) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(collections.institution) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(array_to_string(collections.regions, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(collections.location) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(collections.city_of_publication) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(collections.editor) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(array_to_string(collections.cast_, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(array_to_string(collections.creators, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(collections.directors, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(collections.writers, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(collections.collaborators, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(array_to_string(collections.publisher, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(array_to_string(collections.participants, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(collections.interviewers, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(array_to_string(collections.interviewees, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
      
            LOWER(array_to_string(collections.host_organisation, '||')) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            
            LOWER(concept_tag.tag_name) LIKE '%' || LOWER($${paramCounter}) || '%' OR
            LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($${paramCounter}) || '%' 
          )
      `;
        profilesWhereStatement = `
        ${profilesWhereStatement}
        AND (
          LOWER(profiles.full_name) LIKE '%' || LOWER($${paramCounter}) || '%' OR
          LOWER(profiles.field_expertise) LIKE '%' || LOWER($${paramCounter}) || '%' OR
          LOWER(profiles.city) LIKE '%' || LOWER($${paramCounter}) || '%' OR
          LOWER(profiles.country) LIKE '%' || LOWER($${paramCounter}) || '%' OR
          LOWER(profiles.affiliation) LIKE '%' || LOWER($${paramCounter}) || '%'
        )
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

      items = await db.manyOrNone(itemsQuery, params);

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

      collections = await db.manyOrNone(collectionsQuery, params);
      let collectionsPromise = [];
      if (collections.length) {
        collectionsPromise = collections.map( async c => {
          return new Promise( async resolve => {
            const collectionsItems = await db.manyOrNone('SELECT item_s3_key FROM tba21.collections_items WHERE collection_id = $1 ', [c.id]);
            resolve({...c,  s3_key: collectionsItems.map( i => i.item_s3_key ) });
          });
        });
      }

      collections = await Promise.all(collectionsPromise);

      const profilesQuery = `
        SELECT id, full_name, profile_image, country, city, affiliation, profile_type,
        COALESCE(field_expertise, '') as field_expertise
        FROM ${process.env.PROFILES_TABLE}
          WHERE public_profile = true
            AND (
              profile_type = 'Individual' OR
              profile_type = 'Collective' OR
              profile_type = 'Institution'
            )
          ${profilesWhereStatement}
          GROUP BY profiles.id
          LIMIT $1
          OFFSET $2
      `;
      profiles = await db.manyOrNone(profilesQuery, params);
    }

    return successResponse({
       results: [...items, ...collections, ...profiles],
     });

  } catch (e) {
    console.log('/pages/pages.search ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
