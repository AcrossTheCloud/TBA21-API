import { db } from '../databaseConnect';
import { badRequestResponse, headers, internalServerErrorResponse, unAuthorizedRequestResponse } from '../common';

/**
 *
 * Create a profile
 *
 * @param requestBody
 */
export const insertProfile = async (requestBody) => {
  try {
    const params = [requestBody.full_name, requestBody.uuid];
    const query = `
      INSERT INTO ${process.env.PROFILES_TABLE} 
        (full_name, cognito_uuid, profile_type, accepted_license) 
      VALUES 
        ($1, $2::uuid, 'Public', false) 
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
export const updateProfile = async (requestBody, isAdmin: Boolean, userId?: String) => {
  try {
    let paramCounter = 0;
    const params = [];

 // if the users uuid is the same as the profiles or if they're an admin, allow them to edit it
    if (userId || isAdmin) {
      params.push(userId);
      paramCounter++;
      const SQL_SETS: string[] = Object.keys(requestBody).map((key) => {
          params[paramCounter++] = requestBody[key];
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