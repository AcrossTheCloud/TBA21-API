import {
  badRequestResponse,
  headers,
  internalServerErrorResponse,
  successResponse,
  unAuthorizedRequestResponse
} from '../common';

import { db, pgp } from '../databaseConnect';
import { qldbQuery } from '../REST/QLDB';
import { geoJSONToGeom } from '../map/util';

import { changeS3ProtectionLevel } from '../utils/AWSHelper';
import { dbgeoparse } from '../utils/dbgeo';

export const getAll = async (limit, offset, isAdmin: boolean, inputQuery?, byField?: string, fieldValue?: string, userId?: string, uuid?: string, order?) => {
  try {

    const
      params = [limit, offset];

    let searchQuery = '';
    let orderBy = isAdmin ? 'item.updated_at DESC NULLS LAST' : 'item.s3_key';
    if (order === 'ascending') {
      orderBy = 'item.created_at ASC NULLS LAST';
    } else if (order === 'descending') {
      orderBy = 'item.created_at DESC NULLS LAST';
    }

    if (isAdmin && inputQuery && inputQuery.length > 0) {
      params.push(inputQuery);

      searchQuery = `
            WHERE 
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
          
              ISBN::text LIKE '%' || ($3) || '%' OR
              related_ISBN::text LIKE '%' || ($3) || '%' OR
              LOWER(DOI) LIKE '%' || LOWER($3) || '%' OR
          
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
              LOWER(array_to_string(organisation, '||')) LIKE '%' || LOWER($3) || '%' OR
              
              LOWER(concept_tag.tag_name) LIKE '%' || LOWER($3) || '%' OR
              LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($3) || '%' 
          `;
    }
    if (byField && byField.match(/(tag|type|person)/)) {
      params.push(fieldValue);
    }

    if (userId) {
      params.push(userId);
    }

    const conditionsLinker = (!isAdmin || searchQuery.length > 0) ? 'AND' : 'WHERE';

    if (!!uuid) {
      params.push(uuid);
    }

    const
      query = `
          SELECT
            COUNT ( item.s3_key ) OVER (),
            item.*,
            COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
            COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
            ST_AsText(item.geom) as geom
          FROM 
            ${process.env.ITEMS_TABLE} AS item,
              
            UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
              LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                      
            UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
              LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid

          ${isAdmin ? searchQuery : 'WHERE status=true'}

          ${userId || uuid ? ` WHERE contributor = $${params.length}::uuid ` : ''}
          
          ${(byField === 'tag') ? ` ${conditionsLinker} (
            LOWER(concept_tag.tag_name) LIKE '%' || LOWER($${params.length}) || '%'
            OR
            LOWER(keyword_tag.tag_name) LIKE '%' || LOWER($${params.length}) || '%'
          )` : ''}

          ${(byField === 'type') ? ` ${conditionsLinker} (item.item_type::varchar = $${params.length})` : ''}

          ${(byField === 'person') ? ` ${conditionsLinker} ( 
            LOWER(CONCAT(item.writers, item.creators, item.collaborators, item.directors, item.interviewers, item.interviewees, item.cast_)) LIKE '%' || LOWER($${params.length}) || '%' 
          )` : ''}
              
          GROUP BY item.s3_key
          ORDER BY  ${orderBy} 
  
          LIMIT $1 
          OFFSET $2 
        `;

    return successResponse({data: await dbgeoparse(await db.any(query, params), null)});
  } catch (e) {
    console.log('items/model.get ERROR - ', e);
    return badRequestResponse();
  }
};

export const getItemBy = async (field, value, isAdmin: boolean = false, isContributor: boolean = false, userId?: string) => {
  try {
    const
      params = [value];

    const
      query = `
          SELECT
            item.*,
            COALESCE(json_agg(DISTINCT concept_tag.*) FILTER (WHERE concept_tag IS NOT NULL), '[]') AS aggregated_concept_tags,
            COALESCE(json_agg(DISTINCT keyword_tag.*) FILTER (WHERE keyword_tag IS NOT NULL), '[]') AS aggregated_keyword_tags,
            ST_AsText(item.geom) as geom 
          FROM 
            ${process.env.ITEMS_TABLE} AS item,
              
            UNNEST(CASE WHEN item.concept_tags <> '{}' THEN item.concept_tags ELSE '{null}' END) AS concept_tagid
              LEFT JOIN ${process.env.CONCEPT_TAGS_TABLE} AS concept_tag ON concept_tag.ID = concept_tagid,
                      
            UNNEST(CASE WHEN item.keyword_tags <> '{}' THEN item.keyword_tags ELSE '{null}' END) AS keyword_tagid
              LEFT JOIN ${process.env.KEYWORD_TAGS_TABLE} AS keyword_tag ON keyword_tag.ID = keyword_tagid
          
          WHERE item.${field}=$1
          ${(isAdmin || !!userId) ? '' : 'AND status = true'}
          ${isContributor && !!userId ? ` AND contributor = '${userId}'::uuid ` : ''}

          GROUP BY item.s3_key
        `;

    const result = await db.oneOrNone(query, params);
    const data = result ? await dbgeoparse([result], null) : null;

    return successResponse({ data });
  } catch (e) {
    console.log('admin/items/items.getById ERROR - ', e);
    return badRequestResponse();
  }
};

export const update = async (requestBody, isAdmin: boolean, userId?: string) => {
  try {

    let message: string = '';
    if (requestBody.hasOwnProperty('status')) {
      // Change the s3 level to Private or Public
      const levelResponse = await changeS3ProtectionLevel(requestBody.s3_key, requestBody.status ? 'public-read' : 'private');
      if (!levelResponse) {
        // If we fail to set the level, console log
        console.log(`Error updating S3 Protection Level for ${requestBody.s3_key}`);

        message = 'Couldn\'t set access level on file, this item has now been unpublished.';
        // and set the level to unpublished.
        requestBody.status = false;
      }
    }

    let
      paramCounter = 0,
      hasGeoData = false,
      geoData;

    // Grab our geoJSON if we have it
    if (requestBody.geojson) {
      if (Object.keys(requestBody.geojson.features).length) {
        hasGeoData = true;
        geoData = requestBody.geojson;
      } else {
        Object.assign(requestBody, {geom: null});
      }
      // Always delete geojson as we don't have a column for it.
      delete requestBody.geojson;
    }

    if (requestBody.keyword_tags) {
      requestBody.keyword_tags = requestBody.keyword_tags.map(t => parseInt(t, 0));
    }
    if (requestBody.concept_tags) {
      requestBody.concept_tags = requestBody.concept_tags.map(t => parseInt(t, 0));
    }

    // NOTE: contributor is inserted on create, uuid from claims
    const params = [];
    params[paramCounter++] = requestBody.s3_key;

    // pushed into from SQL SET map
    // An array of strings [`publish='abc'`, `cast_ = 'the rock'`]
    const SQL_SETS: string[] = Object.entries(requestBody)
      .filter(([e, v]) => (e !== 's3_key')) // remove s3_key
      .map(([key, value]) => {

        // @ts-ignore
        if ((typeof(value) === 'string' || Array.isArray(value)) && value.length === 0) {
          requestBody[key] = null;
        }

        params[paramCounter++] = requestBody[key];
        return `${key === 'language' ? `"${key}"` : key}=$${paramCounter}`;
      });

    // If we have geoJSON push it into SQL SETS
    if (hasGeoData && Object.keys(geoData).length) {
      SQL_SETS.push(`geom=ST_GeomFromText('GeometryCollection(${(await geoJSONToGeom(geoData)).join(',')})', 4326)`);
    }
    const updatedAt = new Date().toISOString();
    let query = `UPDATE ${process.env.ITEMS_TABLE}
            SET 
              updated_at='${updatedAt}',
              ${SQL_SETS.join(', ')}
          WHERE s3_key = $1 `;

    if (!isAdmin) {
      params[paramCounter++] = userId;
      query += ` and contributor = $${paramCounter} `;
    }

    query += ` returning s3_key, status, id;`;

    if (SQL_SETS.length) {
      const result = await db.oneOrNone(query, params);
      if (!result) {
        throw new Error('unauthorized');
      }

      const bodyResponse = {
        success: true,
        updated_key: result.s3_key,
        id: result.id
      };

      // Update QLDB
      const formattedPGQuery = pgp.as.format(`UPDATE item_history SET updated_at='${updatedAt}', ${SQL_SETS.join(',')} WHERE id=${result.id}`, params);
      await qldbQuery(formattedPGQuery);

      // If we have a message, add it to the response.
      if (message.length > 1) {
        Object.assign(bodyResponse, {message: message, success: false});
      }

      return {
        body: JSON.stringify(bodyResponse),
        headers: headers,
        statusCode: 200
      };
    } else {
      throw new Error('Nothing to update');
    }
  } catch (e) {
    if ((e.message === 'Nothing to update')) {
      return successResponse(e.message);
    } else if (e.message === 'unauthorized') {
      return unAuthorizedRequestResponse('You are not a contributor for this item');
    } else {
      console.log('/items/model/update ERROR - ', e);
      return internalServerErrorResponse();
    }
  }
};

export const deleteItm = async (s3Key, isAdmin: boolean, userId?: string) => {
  try {
    const params = [s3Key];
    let query = `DELETE FROM ${process.env.ITEMS_TABLE}
          WHERE items.s3_key=$1 `;

    if (!isAdmin) {
      params.push(userId);
      query += ` and contributor = $2 `;
    }
    query += ` returning id;`;

    const delResult = await db.oneOrNone(query, params);
    if (!delResult) {
      throw new Error('unauthorized');
    }
    // if the item was successfully deleted, we delete any associated entries in the short paths table.
    if (delResult) {
      await db.any(
        `DELETE FROM ${process.env.SHORT_PATHS_TABLE}
                          WHERE EXISTS (
                            SELECT * FROM ${process.env.SHORT_PATHS_TABLE}
                            WHERE object_type = 'Item'
                            AND id = $1 )`,
        [delResult.id]);
    }

    // Query QLDB
    await qldbQuery(`DELETE FROM ${process.env.ITEMS_TABLE} WHERE id=${delResult.id}`);

    return successResponse(true);
  } catch (e) {
    if (e.message === 'unauthorized') {
      return unAuthorizedRequestResponse('You are not a contributor for this item');
    } else {
      console.log('/items/items.deleteItem ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};
