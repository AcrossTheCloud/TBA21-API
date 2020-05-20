import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, successResponse } from '../common';
import { db } from '../databaseConnect';
import Joi from '@hapi/joi';

export const get = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {

    await Joi.assert(event.queryStringParameters, Joi.object().keys({
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
          UNACCENT(title) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(original_title) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(event_title) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(subtitle) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(description) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(institution) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(news_outlet) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(array_to_string(regions, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(location) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(city_of_publication) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(featured_in) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(editor) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(array_to_string(cast_, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(lecturer) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(project) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(record_label) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(array_to_string(creators, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(directors, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(writers, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(collaborators, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(authors, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(array_to_string(publisher, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(produced_by, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(array_to_string(participants, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(interviewers, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(interviewees, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(array_to_string(speakers, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(performers, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
          UNACCENT(array_to_string(host_organisation, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
          UNACCENT(array_to_string(organisation, '||')) ILIKE '%' || UNACCENT($1) || '%' 
        )
      
      AND title not ilike '%Banner:%';
       
      GROUP BY item.s3_key
      ORDER BY item.updated_at DESC NULLS LAST
    `;
    const collectionsQuery = `
      SELECT title, subtitle, description, institution, regions, location, city_of_publication, editor, cast_, creators, directors, writers, collaborators, publisher, participants, interviewers, interviewees, host_organisation
      FROM ${process.env.COLLECTIONS_TABLE}
        WHERE ${process.env.COLLECTIONS_TABLE}.status = true
          AND (
            UNACCENT(collections.title) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(collections.subtitle) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(collections.description) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(collections.institution) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(array_to_string(collections.regions, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(collections.location) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(collections.city_of_publication) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(collections.editor) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(array_to_string(collections.cast_, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(array_to_string(collections.creators, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(array_to_string(collections.directors, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(array_to_string(collections.writers, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(array_to_string(collections.collaborators, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(array_to_string(collections.publisher, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(array_to_string(collections.participants, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(array_to_string(collections.interviewers, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(array_to_string(collections.interviewees, '||')) ILIKE '%' || UNACCENT($1) || '%' OR
      
            UNACCENT(array_to_string(collections.host_organisation, '||')) ILIKE '%' || UNACCENT($1) || '%'
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
            UNACCENT(profiles.full_name) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(profiles.field_expertise) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(profiles.city) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(profiles.country) ILIKE '%' || UNACCENT($1) || '%' OR
            UNACCENT(profiles.affiliation) ILIKE '%' || UNACCENT($1) || '%'
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

    await Joi.assert(data, Joi.object().keys({
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

    const focusArts: string = data.hasOwnProperty('focus_arts') && data.focus_arts ? ` AND focus_arts = 1`  : ``;
    const focusAction: string = data.hasOwnProperty('focus_action') && data.focus_action ? ` AND focus_action = 1`  : ``;
    const focusScitech: string = data.hasOwnProperty('focus_scitech') && data.focus_scitech ? ` AND focus_scitech = 1`  : ``;

    let
      itemsWhereStatement = [],
      collectionsWhereStatement = [],
      profilesWhereStatement = [],
      items = [],
      collections = [],
      profiles = [],
      paramCounter = 3;

    const queryLoop = (list: {field: string, value: string}[]) => {
      for (let i = 0; i < list.length; i++) {
        const field = list[i].field;

        const addToParams = (type?: string): string => {
          type = type ? `${type}.` : '';
          params.push(`${type}${field}`, list[i].value);
          return `UNACCENT($${paramCounter++}:raw::text) ILIKE '%' || UNACCENT($${paramCounter++}) || '%'`;
        };

        if (field === 'full_name' || field === 'country' || field === 'city' || field === 'affiliation' || field === 'profile_type') {
          // Profile only
          profilesWhereStatement.push(addToParams('profiles'));
        } else if (field === 'concept_tag' || field === 'keyword_tag') {
          itemsWhereStatement.push(addToParams());
          collectionsWhereStatement.push(addToParams());
        } else if (field === 'interviewers') {
          // Collection only
          collectionsWhereStatement.push(addToParams('collections'));
        } else if (field === 'original_title' ||
          field === 'event_title' ||
          field === 'news_outlet' ||
          field === 'featured_in' ||
          field === 'lecturer' ||
          field === 'project' ||
          field === 'record_label' ||
          field === 'authors' ||
          field === 'produced_by' ||
          field === 'interviewers' ||
          field === 'speakers' ||
          field === 'performers' ||
          field === 'produced_by' ||
          field === 'organisation') {
          // item Only
          itemsWhereStatement.push(addToParams('item'));
        } else {
          itemsWhereStatement.push(addToParams('item'));
          collectionsWhereStatement.push(addToParams('collections'));
        }
      }
    };

    if (data.criteria && data.criteria.length) {
      queryLoop(data.criteria);

      if (itemsWhereStatement.length) {
        const itemsQuery = `
        SELECT
          item.id,
          item.s3_key,
          item.title,
          item.created_at as date,
          item.creators,
          item.file_dimensions,
          item.item_type as type,
          COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS concept_tags,
          COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS keyword_tags
        FROM ${process.env.ITEMS_TABLE} AS item,
          UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
            LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                    
          UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
            LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
        WHERE status = true
          AND item.title not ilike '%Banner:%';
          AND ( ${itemsWhereStatement.join(' OR ')} )
          ${focusArts}
          ${focusAction}
          ${focusScitech}
        GROUP BY item.s3_key
        ORDER BY item.updated_at DESC NULLS LAST
        LIMIT $1
        OFFSET $2
      `;

        items = await db.manyOrNone(itemsQuery, params);
      }

      if (collectionsWhereStatement.length) {
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
            AND ( ${collectionsWhereStatement.join(' OR ')} )
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
          collectionsPromise = collections.map(async c => {
            return new Promise(async resolve => {
              const collectionsItems = await db.manyOrNone('SELECT item_s3_key FROM tba21.collections_items WHERE collection_id = $1 ', [c.id]);
              resolve({...c, s3_key: collectionsItems.map(i => i.item_s3_key)});
            });
          });
        }

        collections = await Promise.all(collectionsPromise);
      }

      if (profilesWhereStatement.length) {
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
          AND ( ${profilesWhereStatement.join(' OR ')} )
          GROUP BY profiles.id
          LIMIT $1
          OFFSET $2
      `;
        profiles = await db.manyOrNone(profilesQuery, params);
      }
    }

    return successResponse({
       results: [
         ...items.map(e => Object.assign(e, { item: true })),
         ...collections.map(e => Object.assign(e, { collection : true })),
         ...profiles.map(e => Object.assign(e, { profile : true }))
       ],
     });

  } catch (e) {
    console.log('/pages/pages.search ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
