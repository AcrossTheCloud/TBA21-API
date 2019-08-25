import { badRequestResponse, headers, internalServerErrorResponse } from '../common';
import { db } from '../databaseConnect';

export const createCollection = async (data) => {
  try {

    if (data.keyword_tags) {
      data.keyword_tags = data.keyword_tags.map( t => parseInt(t, 0));
    }
    if (data.concept_tags) {
      data.concept_tags = data.concept_tags.map( t => parseInt(t, 0));
    }

    let paramCounter = 0;

    const
      params = [],
      sqlFields: string[] = Object.keys(data).filter(e => (e !== 'items')).map((key) => {
       if (key === 'contributors') {
         return `contributors`;
       }
       return `${key}`;
      }),
      sqlParams: string[] = Object.keys(data).filter(e => (e !== 'items')).map((key) => {
        params[paramCounter++] = data[key];
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
      if (data.items && data.items.length > 0) {
        const
          SQL_INSERTS: string[] = data.items.map((item, index) => (`($1, $${index + 2})`)),
          addQuery = `INSERT INTO ${process.env.COLLECTIONS_ITEMS_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`,
          addParams = [insertedObject.id, ...data.items];

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
    if ((e.message === 'Nothing to update') || (e.isJoi)) {
      return badRequestResponse(e.message);
    } else {
      console.log('/admin/collections/insert ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};

export const updateById = async (data) => {
    try {
  
      if (data.keyword_tags) {
        data.keyword_tags = data.keyword_tags.map( t => parseInt(t, 0));
      }
      if (data.concept_tags) {
        data.concept_tags = data.concept_tags.map( t => parseInt(t, 0));
      }
      let paramCounter = 0;
  
      const params = [];
      params[paramCounter++] = data.id;
      // pushed into from SQL SET map
      // An array of strings [`publish='abc'`, `cast_ = 'the rock'`]
      const SQL_SETS: string[] = Object.keys(data)
        .filter(e => ((e !== 'id') && (e !== 'items'))) // remove id and items
        .map((key) => {
          params[paramCounter++] = data[key];
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
  
      if (!SQL_SETS.length && !data.items) {
        return badRequestResponse('Nothing to update');
      }
  
      // If we have items in SQL_SETS do the query.
      if (SQL_SETS.length) {
        await db.one(query, params);
      }
  
      // If we have items to assign to the collection
      if (data.items) {
        await db.task(async t => {
  
          let currentItems = await db.any(`select item_s3_key from ${process.env.COLLECTIONS_ITEMS_TABLE} where collection_id=$1`, [data.id]);
          currentItems = currentItems.map(e => (e.item_s3_key));
  
          const
            toBeAdded = data.items.filter((e) => (currentItems.indexOf(e) < 0)),
            toBeRemoved = currentItems.filter((e) => (data.items.indexOf(e) < 0));
  
          if (toBeAdded.length > 0) {
            const
              SQL_INSERTS: string[] = toBeAdded.map((item, index) => {
                return `($1, $${index + 2})`;
              }),
              addQuery = `INSERT INTO ${process.env.COLLECTIONS_ITEMS_TABLE} (collection_id, item_s3_key) VALUES ${[...SQL_INSERTS]}`,
              addParams = [data.id, ...toBeAdded];
  
            await t.any(addQuery, addParams);
          }
  
          if (toBeRemoved.length > 0) {
            const
              SQL_REMOVES: string[] = toBeRemoved.map((item, index) => {
                return `$${index + 2}`;
              }),
              removeQuery = `DELETE from ${process.env.COLLECTIONS_ITEMS_TABLE}  where collection_id =$1 and item_s3_key in (${[...SQL_REMOVES]})`,
              removeParams = [data.id, ...toBeRemoved];
  
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
        console.log('/admin/collections/update ERROR - ', !e.isJoi ? e : e.details);
        return badRequestResponse();
      }
    }
  };
  