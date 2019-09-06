import { badRequestResponse, headers, internalServerErrorResponse, successResponse, unAuthorizedRequestResponse } from '../common';
import { db } from '../databaseConnect';
import { changeS3ProtectionLevel } from '../utils/AWSHelper';

export const update = async (requestBody, isAdmin: Boolean, userId?: String) => {
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

        if (requestBody.keyword_tags) {
            requestBody.keyword_tags = requestBody.keyword_tags.map(t => parseInt(t, 0));
        }
        if (requestBody.concept_tags) {
            requestBody.concept_tags = requestBody.concept_tags.map(t => parseInt(t, 0));
        }

        let paramCounter = 0;

        // NOTE: contributor is inserted on create, uuid from claims
        const params = [];

        params[paramCounter++] = requestBody.s3_key;
        // pushed into from SQL SET map
        // An array of strings [`publish='abc'`, `cast_ = 'the rock'`]
        const SQL_SETS: string[] = Object.keys(requestBody)
            .filter(e => (e !== 's3_key')) // remove s3_key
            .map((key) => {
                params[paramCounter++] = requestBody[key];
                return `${key}=$${paramCounter}`;
            });
        let query = `UPDATE ${process.env.ITEMS_TABLE}
            SET 
              updated_at='${new Date().toISOString()}',
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
            // If we have a message, add it to the response.
            if (message.length > 1) {
                Object.assign(bodyResponse, { message: message, success: false });
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

export const deleteItm = async (s3Key, isAdmin: Boolean, userId?: String) => {
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

        if (delResult) {
            await db.any(`
                          DELETE FROM ${process.env.SHORT_PATHS_TABLE}
                          WHERE EXISTS (
                            SELECT * FROM ${process.env.SHORT_PATHS_TABLE}
                            WHERE object_type = 'Item'
                            AND id = $1 )`,
                         [delResult.id]);
        }

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
