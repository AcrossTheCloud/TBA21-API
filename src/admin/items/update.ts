import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { badRequestResponse, headers, internalServerErrorResponse } from '../../common';
import { db } from '../../databaseConnect';
import Joi from '@hapi/joi';

/**
 *
 * Update an item by its s3_key
 *
 * @param event {APIGatewayEvent}
 *
 * @returns { Promise<APIGatewayProxyResult> } JSON object with body:collections - a collections list of the results
 */

// s3_key varchar(1024) PRIMARY KEY NOT NULL ,
// sha512 char(128), ->  helpers update
// exif jsonb, -- for things that don't go into other columns -> helpers
// machine_recognition_tags jsonb, -> helpers
// md5 char(32), -> helpers 
// image_hash char(64), -> helpers
// created_at timestamp with time zone NOT NULL, -> helpers
// updated_at timestamp with time zone NOT NULL, -> automtically updated
// time_produced timestamp with time zone,
// status boolean, -- false=draft, true=public
// concept_tags bigint[],
// keyword_tags bigint[],
// place varchar(128),
// country_or_ocean varchar(128),
// item_type bigint references tba21.types(id) ON DELETE CASCADE,
// creators varchar(256)[],
// contributor uuid,
// directors varchar(256)[],
// writers varchar(256)[],
// collaborators varchar(256),
// exhibited_at varchar(256),
// series varchar(256),
// ISBN numeric(13),
// edition numeric(3),
// publisher varchar(256)[],
// interviewers varchar(256)[],
// interviewees varchar(256)[],
// cast_ varchar(256),
// license tba21.licence_type,
// title varchar(256),
// description varchar(256),
// map_icon varchar(1024) -- path to s3 object

export const updateByS3key = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const  data = JSON.parse(event.body);
        await Joi.validate(data, Joi.object().keys(
            {
                s3_key: Joi.string().required(),
                status: Joi.boolean(), // -- false=draft, true=public
                concept_tags: Joi.array().items(Joi.number().integer()),
                keyword_tags: Joi.array().items(Joi.number().integer()),
                place: Joi.string(),
                country_or_ocean: Joi.string(),
                item_type: Joi.number().integer(),
                creators: Joi.array().items(Joi.string()),
                contributor: Joi.string().uuid(),
                directors: Joi.array().items(Joi.string()),
                writers: Joi.array().items(Joi.string()),
                collaborators: Joi.string(),
                exhibited_at: Joi.string(),
                series: Joi.string(),
                ISBN: Joi.number().integer(),
                edition: Joi.number().integer(),
                publisher: Joi.array().items(Joi.string()),
                interviewers: Joi.array().items(Joi.string()),
                interviewees: Joi.array().items(Joi.string()),
                cast_: Joi.string(),
                license: Joi.string(),
                title: Joi.string(),
                description: Joi.string(),
                map_icon: Joi.string()
            }));
        // will cause an exception if it is not valid

        let paramCounter = 0;

        // NOTE: contributor is inserted on create, uuid from claims
        const params = [];
        params[paramCounter++] = data.s3_key;
        // pushed into from SQL SET map
        // An array of strings [`publish='abc'`, `cast_ = 'the rock'`]
        const SQL_SETS: string[] = Object.keys(data)
            .filter(e => (e !== 's3_key')) // remove s3_key
            .map((key) => {
                params[paramCounter++] = data[key];
                return `${key}=$${paramCounter}`;
            });
        let
            query = `UPDATE ${process.env.ITEMS_TABLE}
        SET 
          updated_at='${new Date().toISOString()}',
          ${[...SQL_SETS]}
        WHERE s3_key = $1 returning s3_key;
      `;

        //console.log(query, params);

        if (SQL_SETS.length) {
            let result = await db.one(query, params);

            return {
                body: JSON.stringify({
                    success: true,
                    updated_key: result.s3_key
                }),
                headers: headers,
                statusCode: 200
            };
        }
        else {
            throw new Error('Nothing to update');
        }


    } catch (e) {
        if ((e.message === 'Nothing to update') || (e.isJoi)) {
            return badRequestResponse(e.message);
        } else {
            console.log('/admin/collections/update ERROR - ', e);
            return internalServerErrorResponse();
        }
    }
};
