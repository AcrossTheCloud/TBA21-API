import { badRequestResponse, headers, successResponse } from '../../common';
import { db } from '../../databaseConnect';

/**
 *
 * Insert an announcement
 *
 * @param isAdmin: boolean
 * @param data: { string }
 * @param userId: string
 * @returns { Promise<APIGatewayProxyResult> } body:{ success: boolean, id: string }
 */
export const insertAnnouncement = async(isAdmin: boolean, data, userId?: string ) => {
  try {
    let paramCounter = 0;
    // Only an admin can publish an announcement, so we set the status to false if the uploader isn't an admin
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

/**
 *
 * Get an announcement
 *
 * @param isAdmin: boolean
 * @param params: [ string ]
 * @param userId: string
 * @param id: string
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:{ announcements[{'id', 'title', 'description', 'url', 'created_at', 'status', 'contributor', 'count'}]  }
 */
export const getAnnouncement = async(isAdmin: boolean, params, userId?: string, id?: string ) => {
  try {
    let query = `
        SELECT *,
        COUNT ( id ) OVER ()
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        ${id ? `WHERE id = ${id}` : ''}
        ORDER BY created_at DESC
        LIMIT $1
        OFFSET $2
          `;
    // If the user is not an admin, only show their own announcements
    if (!isAdmin) {
      query = `
        SELECT *,
        COUNT ( id ) OVER ()
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        WHERE contributor = '${userId}'
        ${id ? `AND id = ${id}` : ''}
        ORDER BY created_at DESC
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
