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

    await Joi.validate(data, Joi.object().keys(
      {
         id: Joi.number().integer().required()
      }));

    const
      { id } = data,
      sqlParams = [Number(id)],
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
    console.log(e);
    if (e.isJoi) {
      return badRequestResponse();
    } else {
      console.log('/tags/tags.remove ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
