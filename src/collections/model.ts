import { badRequestResponse, headers, internalServerErrorResponse } from '../common';
import { db } from '../databaseConnect';

export const create = async (requestBody) => {
  try {

    if (requestBody.keyword_tags) {
      requestBody.keyword_tags = requestBody.keyword_tags.map(t => parseInt(t, 0));
    }
    if (requestBody.concept_tags) {
      requestBody.concept_tags = requestBody.concept_tags.map(t => parseInt(t, 0));
    }

    let paramCounter = 0;

    const
      params = [],
      sqlFields: string[] = Object.keys(requestBody).filter(e => (e !== 'items')).map((key) => {
        if (key === 'contributors') {
          return `contributors`;
        }
        return `${key}`;
      }),
      sqlParams: string[] = Object.keys(requestBody).filter(e => (e !== 'items')).map((key) => {
        params[paramCounter++] = requestBody[key];
        if (key === 'contributors') {
          return `$${paramCounter}::uuid[]`;
        }
        return `$${paramCounter}`;
      });

    sqlFields.push('created_at', 'updated_at');
    sqlParams.push('now()', 'now()');

    const query = `INSERT INTO ${process.env.COLLECTIONS_TABLE} (${[...sqlFields]}) VALUES (${[...sqlParams]}) RETURNING id;`;

    const insertResult = await db.task(async t => {
      const insertedObject = await t.one(query, params);

      // If we have items
      if (requestBody.items && requestBody.items.length > 0) {
        const
          SQL_INSERTS: string[] = requestBody.items.map((item, index) => (`($1, $${index + 2})`)),
          addQuery = `INSERT INTO ${process.env.COLLECTIONS_ITEMS_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`,
          addParams = [insertedObject.id, ...requestBody.items];

        await t.any(addQuery, addParams);
      }

      return insertedObject;
    });

    return {
      body: JSON.stringify({ success: true, id: insertResult.id }),
      headers: headers,
      statusCode: 200
    };

  } catch (e) {
    console.log('src/collections/model/create ERROR - ', e.details);
    return internalServerErrorResponse();
  }
};

export const update = async (requestBody) => {
  try {

    if (requestBody.keyword_tags) {
      requestBody.keyword_tags = requestBody.keyword_tags.map(t => parseInt(t, 0));
    }
    if (requestBody.concept_tags) {
      requestBody.concept_tags = requestBody.concept_tags.map(t => parseInt(t, 0));
    }
    let paramCounter = 0;

    const params = [];
    params[paramCounter++] = requestBody.id;
    // pushed into from SQL SET map
    // An array of strings [`publish='abc'`, `cast_ = 'the rock'`]
    const SQL_SETS: string[] = Object.keys(requestBody)
      .filter(e => ((e !== 'id') && (e !== 'items'))) // remove id and items
      .map((key) => {
        params[paramCounter++] = requestBody[key];
        if (key === 'contributors') {
          return `${key}=$${paramCounter}::uuid[]`;
        }
        return `${key}=$${paramCounter}`;
      }),
      query = `
          UPDATE ${process.env.COLLECTIONS_TABLE}
          SET 
            updated_at='${new Date().toISOString()}',
            ${[...SQL_SETS]}
          WHERE id = $1 returning id;
        `;

    if (!SQL_SETS.length && !requestBody.items) {
      return badRequestResponse('Nothing to update');
    }

    // If we have items in SQL_SETS do the query.
    if (SQL_SETS.length) {
      await db.one(query, params);
    }

    // If we have items to assign to the collection
    if (requestBody.items) {
      await db.task(async t => {

        let currentItems = await db.any(`select item_s3_key from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`, [requestBody.id]);
        currentItems = currentItems.map(e => (e.item_s3_key));

        const
          toBeAdded = requestBody.items.filter((e) => (currentItems.indexOf(e) < 0)),
          toBeRemoved = currentItems.filter((e) => (requestBody.items.indexOf(e) < 0));

        if (toBeAdded.length > 0) {
          const
            SQL_INSERTS: string[] = toBeAdded.map((item, index) => {
              return `($1, $${index + 2})`;
            }),
            addQuery = `INSERT INTO ${process.env.COLLECTIONS_ITEMS_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`,
            addParams = [requestBody.id, ...toBeAdded];

          await t.any(addQuery, addParams);
        }

        if (toBeRemoved.length > 0) {
          const
            SQL_REMOVES: string[] = toBeRemoved.map((item, index) => {
              return `$${index + 2}`;
            }),
            removeQuery = `DELETE from ${process.env.COLLECTIONS_ITEMS_TABLE}  where collection_id =$1 and item_s3_key in (${[...SQL_REMOVES]})`,
            removeParams = [requestBody.id, ...toBeRemoved];

          await t.any(removeQuery, removeParams);
        }

      });
    }

    return {
      body: JSON.stringify({ success: true }),
      headers: headers,
      statusCode: 200
    };

  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('src/collections/model/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};

export const deleteCollection = async (id: Number) => {
  try {

    const
      params = [id],
      query = `
          DELETE FROM ${process.env.COLLECTIONS_TABLE}
          WHERE id = $1;
  
          DELETE FROM ${process.env.COLLECTIONS_ITEMS_TABLE}
          WHERE collection_id = $1
        `;

    await db.any(query, params);

    return {
      body: 'true',
      headers: headers,
      statusCode: 200
    };
  } catch (e) {
    console.log('src/collections/model/deleteCollection ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
