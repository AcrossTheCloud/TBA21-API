import { badRequestResponse, headers, successResponse } from '../../common';
import { db } from '../../databaseConnect';

export const insertAnnouncement = async(isAdmin: boolean, data, userId?: string ) => {
  try {
    let paramCounter = 0;

    if (!isAdmin) {
      Object.assign(data, {'status': false, 'contributor': `${userId}`});
    }

    Object.assign(data, {'contributor': `${userId}`});

    const
      params = [],
      sqlFields: string[] = Object.keys(data).map((key) => {
        return `${key}`;
      }),
      sqlParams: string[] = Object.keys(data).map((key) => {
        params[paramCounter++] = data[key];
        const hasUUID = (key === 'contributor' ? '::uuid' : '');
        return `$${paramCounter}${hasUUID}`;
      });

    sqlFields.push('created_at');
    sqlParams.push('now()');

    const
      query = `
        INSERT INTO ${process.env.ANNOUNCEMENTS_TABLE} (${[...sqlFields]}) 
        VALUES (${[...sqlParams]})
        RETURNING id;
      ;`;

    const insertResult = await db.one(query, params);

    return {
      body: JSON.stringify({ success: true, ...insertResult }),
      headers: headers,
      statusCode: 200
    };

  } catch (e) {
    console.log('/announcements.insert ERROR - ', e);
    return badRequestResponse();
  }
};

export const getAnnouncement = async(isAdmin: boolean, params, userId?: string, id?: string, order?: string | null ) => {
  try {
    let orderBy = 'created_at DESC';
    if (order === 'asc') {
      orderBy = 'created_at ASC';
    }
    if (order === 'desc') {
      orderBy = 'created_at DESC';
    }
    let query = `
        SELECT *,
        COUNT ( id ) OVER ()
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        ${id ? `WHERE id = ${id}` : ''}
        ORDER BY ${orderBy}
        LIMIT $1
        OFFSET $2
          `;

    if (!isAdmin) {
      query = `
        SELECT *,
        COUNT ( id ) OVER ()
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        WHERE contributor = '${userId}'
        ${id ? `AND id = ${id}` : ''}
        ORDER BY ${orderBy}
        LIMIT $1
        OFFSET $2
          `;
    }

    return successResponse({announcements: await db.any(query, params) });
  } catch (e) {
    console.log('/announcements.get ERROR - ', e);
    return badRequestResponse();
  }
};
