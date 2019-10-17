import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from '../../databaseConnect';
import { badRequestResponse, internalServerErrorResponse, successResponse } from '../../common';
import Joi from '@hapi/joi';

/**
 *
 * Removes a tag from DB
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } the deleted tag object {id: number, tag_name: string}
 */
export const remove = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.assert(data, Joi.object().keys(
      {
         id: Joi.number().integer().required()
      }));

    const
      { id } = data,
      idToNumber = Number(id);
    if (isNaN(idToNumber)) {
      return badRequestResponse('id must be a number');
    }
    const
      sqlParams = [idToNumber],
      itemsSql = `
          SELECT id
          FROM ${process.env.ITEMS_TABLE}
          WHERE $1 in (select unnest(array[keyword_tags]))
          `,
      itemsResult =  await db.manyOrNone(itemsSql, sqlParams),
      collectionsSql = `
          SELECT id
          FROM ${process.env.COLLECTIONS_TABLE}
          WHERE $1 in (select unnest(array[keyword_tags]))
      `,
      collectionsResult = await db.manyOrNone(collectionsSql, sqlParams);

    let result;
    if ((collectionsResult && !collectionsResult.length) && (itemsResult && !itemsResult.length)) {
      const
        tableName = process.env.KEYWORD_TAGS_TABLE,
        sqlStatement = `DELETE from  ${tableName}
          where id=$1
          RETURNING id, tag_name;`;

      result = await db.one(sqlStatement, sqlParams);
    } else { return badRequestResponse('Cannot delete a tag that is being used'); }
    return successResponse(!!result);
  } catch (e) {
    console.log('/tags/tags.remove ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

/**
 *
 * Insert Tags from an array of strings
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } an array of tag objects {id: number, tag_name: string}
 */
export const insert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.assert(data, Joi.object().keys(
      {
         tags: Joi.array().items(Joi.string()).required()
      }));

    const
      { tags } = data,
      tableName = process.env.KEYWORD_TAGS_TABLE,
      sqlStatement = `
        WITH tag AS
        (
          SELECT * FROM ${tableName} WHERE tag_name = $1
        ),
        i AS
        (
          INSERT INTO ${tableName}(tag_name)
            VALUES ($1) ON CONFLICT (tag_name) DO NOTHING
          RETURNING id, tag_name
        )

        SELECT * FROM tag UNION ALL SELECT * FROM i;
      `;

    const results = [];
    // Loop through each tag and do a query, returning the tag object and pushing it into a final array
    for (const tag of tags) {
      const result = await db.one(sqlStatement, tag);
      results.push(result);
    }

    return successResponse({ tags: results });
  } catch (e) {
    console.log('/tags/tags.insert ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};

/**
 *
 * Update a tag
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } the updated tag object {id: number, tag_name: string}
 */
export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const data = JSON.parse(event.body);

    await Joi.assert(data, Joi.object().keys(
      {
         id: Joi.number().integer().required(),
         new_tag_name: Joi.string().required()
      }));

    const
      { id, new_tag_name } = data,
      tableName = process.env.KEYWORD_TAGS_TABLE,
      sqlStatement = `UPDATE  ${tableName}
          set tag_name = $1
          where id=$2
          RETURNING id, tag_name;`,
      sqlParams = [new_tag_name, Number(id)];

    const result = await db.one(sqlStatement, sqlParams);

    return successResponse({ updatedTag: result });
  } catch (e) {
    if (e.isJoi) {
      return badRequestResponse();
    } else {
      console.log('/tags/tags.insert ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};