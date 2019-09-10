import { badRequestResponse, successResponse } from '../../common';
import { db } from '../../databaseConnect';

export const getAnnouncement = async(isAdmin: boolean, params, userId?: string, id?: string ) => {
  try {
    let query = `
        SELECT *
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        ${id ? `WHERE id = ${id}` : ''}
        LIMIT $1
        OFFSET $2
          `;

    if (!isAdmin) {
      query = `
        SELECT *
        FROM ${process.env.ANNOUNCEMENTS_TABLE}
        WHERE contributor = '${userId}'
        ${id ? `AND id = ${id}` : ''}
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
