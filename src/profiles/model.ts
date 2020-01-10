import { db } from '../databaseConnect';
import { badRequestResponse, headers, internalServerErrorResponse, unAuthorizedRequestResponse } from '../common';

/**
 *
 * Create a profile
 *
 * @param requestBody
 * @param isAdmin
 */
export const insertProfile = async (requestBody, isAdmin: boolean) => {
  try {
    let paramCounter = 0;

    const
      params = [],
      sqlFields: string[] = Object.keys(requestBody).map((key) => {
        if (key === 'uuid') {
          return `cognito_uuid`;
        }
        return `${key}`;
      }),
      sqlParams: string[] = Object.keys(requestBody).map((key) => {
        params[paramCounter++] = requestBody[key];
        if (key === 'contributors') {
          return `$${paramCounter}::uuid[]`;
        }
        if (key === 'cognito_uuid') {
          return `$${paramCounter}::uuid`;
        }
        return `$${paramCounter}`;
      });

    const query = `
    INSERT INTO ${process.env.PROFILES_TABLE} 
      (${[...sqlFields]}, accepted_license) 
    VALUES 
      (${[...sqlParams]}, false) 
    RETURNING id;`;

    const result = await db.one(query, params);
    return {
      body: JSON.stringify({ success: true, id: result.id }),
      headers: headers,
      statusCode: 200
    };
  } catch (e) {
    if ((e.message === 'Nothing to insert') || (e.isJoi)) {
      return badRequestResponse(e.message);
    } else {
      console.log('/profiles/profiles/insert ERROR - ', !e.isJoi ? e : e.details);
      return internalServerErrorResponse();
    }
  }
};
/**
 *
 * Update a profile
 *
 * @param requestBody
 * @param isAdmin
 * @param userId
 */
export const updateProfile = async (requestBody, isAdmin: boolean, userId?: string) => {
  try {
    let paramCounter = 0;
    const params = [];

 // if the users uuid is the same as the profiles or if they're an admin, allow them to edit it
    if (userId || isAdmin) {
      userId ? params.push(userId) : params.push(requestBody.uuid);
      paramCounter++;
      const SQL_SETS: string[] = Object.keys(requestBody).filter( i => i !== 'uuid').map((key) => {
            params[paramCounter++] = requestBody[key];
            if (key === 'contributors') {
              return `${key}=$${paramCounter}::uuid[]`;
            }
            return `${key}=$${paramCounter}`;

        }),
        query = `
          UPDATE ${process.env.PROFILES_TABLE}
          SET 
            ${SQL_SETS}
          WHERE cognito_uuid = $1::uuid
          returning id
        `;
      await db.one(query, params);

      return {
        body: JSON.stringify({ success: true }),
        headers: headers,
        statusCode: 200
      };
    } else {
      return unAuthorizedRequestResponse('You might not be logged in.');
    }
  } catch (e) {
    if (e.message === 'Nothing to update') {
      return badRequestResponse(e.message);
    } else {
      console.log('/profile/profiles/update ERROR - ', !e.isJoi ? e : e.details);
      return badRequestResponse();
    }
  }
};
/**
 *
 * Delete a users own profile
 *
 *
 * @returns { Promise<APIGatewayProxyResult> } true
 * @param isAdmin
 * @param userId
 */
export const deleteUserProfile = async (isAdmin: boolean, userId: string) => {
  try {
    if ((userId && isAdmin) || (userId)) {
      const
        params = [userId],
        query = `
          DELETE FROM ${process.env.PROFILES_TABLE}
          WHERE cognito_uuid = $1
        `,
        deleteItemsQuery = `
          DELETE FROM ${process.env.ITEMS_TABLE}
          WHERE contributor = $1
      `;
      const getProfileIdQuery = `
          SELECT id 
          FROM ${process.env.PROFILES_TABLE}
          WHERE cognito_uuid = $1
      `;
      let
        profileCheck = await db.manyOrNone(getProfileIdQuery, params),
        profileCheckPromise = [];
      if (profileCheck.length) {
        profileCheckPromise = profileCheck.map ( async c => {
          if ( c.id && c.id.length === 1) {
            return new Promise( async resolve => {
              const deleteShortpath = await db.oneOrNone(`DELETE FROM ${process.env.SHORT_PATHS_TABLE} WHERE id = $1 AND object_type = 'Profile'`, [c.id]);
              resolve(deleteShortpath);
            });
          }
        });
      }
      const checkCollectionsQuery = `
          SELECT id, contributors
          FROM ${process.env.COLLECTIONS_TABLE}
          WHERE collections.contributors @> ARRAY[$1]::uuid[] 
      `;
      let
        collectionsCheck = await db.manyOrNone(checkCollectionsQuery, params),
        collectionsCheckPromise = [];
      if (collectionsCheck.length) {
        collectionsCheckPromise = collectionsCheck.map ( async c => {
          if ( c.contributors && c.contributors.length === 1) {
            return new Promise( async resolve => {
              const deleteCollection = await db.oneOrNone(`DELETE FROM ${process.env.COLLECTIONS_TABLE} WHERE id = $2 AND collections.contributors = $1`, [userId, c.id]);
              resolve(deleteCollection);
            });
          } else {
            return new Promise( async resolve => {
              const editCollection = await db.any(`UPDATE ${process.env.COLLECTIONS_TABLE} SET contributors = array_remove(contributors, $1) WHERE id = $2`, [userId, c.id]);
              resolve(editCollection);
            });
          }
        });
      }
      await Promise.all(collectionsCheckPromise);
      await Promise.all(profileCheckPromise);
      await db.oneOrNone(query, params);
      await db.oneOrNone(deleteItemsQuery, params);

      return {
        body: JSON.stringify({ success: true }),
        headers: headers,
        statusCode: 200
      };
    } else {
      return badRequestResponse();
    }
  } catch (e) {
    console.log('/profile/profiles/deleteProfile ERROR - ', !e.isJoi ? e : e.details);
    return badRequestResponse();
  }
};
