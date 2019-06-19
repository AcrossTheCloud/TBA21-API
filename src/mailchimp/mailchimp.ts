import { APIGatewayEvent, APIGatewayProxyResult, Context, Handler } from 'aws-lambda'; // tslint:disable-line no-implicit-dependencies (Using only the type information from the @types package.)
import axios from 'axios';
import { badRequestResponse, internalServerErrorResponse, successResponse } from '../common';
import { getEmailFromUUID } from '../utils/AWSHelper';
const crypto = require('crypto');

const
  url = `https://${process.env.MC_DC}.api.mailchimp.com/3.0/`,
  headers = {
    Authorization: `apikey ${process.env.MC_APIKEY}`,
  };

/**
 *
 * Gets a list of Segments (Tags)
 *
 * @returns { {name: string}[] }
 */
export const getSegments: Handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const response = await axios.get(url + `/lists/${process.env.MC_AUDIENCE_ID}/segments`, { headers: headers });
    return successResponse(response.data.segments.map( tag => ({ name: tag.name })));
  } catch (e) {
    return internalServerErrorResponse(e);
  }
};

/**
 *
 * Gets a subscribers tags
 *
 * @params { email: string }
 *
 * @returns { {name: string}[] }
 *
 */
export const getSubscriberTags: Handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  if (event.queryStringParameters.hasOwnProperty('email')) {
    try {
      const
        email = hashEmail(event.queryStringParameters.email),
        response = await axios.get(url + `/lists/${process.env.MC_AUDIENCE_ID}/members/${email}/tags`, {headers: headers});

      // Map of tags
      return successResponse(response.data.tags.map(tag => ({name: tag.name})));
    } catch (e) {

      // The user doesn't exist if we return a 404
      // Return an empty list and allow the user to select one and then we'll create them as a subscriber.
      if (e.response.status === 404) {
        return successResponse([]);
      }
      return internalServerErrorResponse();
    }
  } else {
    return badRequestResponse('Email is required.');
  }
};

/**
 *
 * Adds a tag to a subscriber
 *
 * @params { tag: string }
 * @returns { boolean } Always true if the request didn't throw
 *
 */
export const postSubscriberAddTag: Handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log('The event', event);

  return successResponse(event);

  // if (event.queryStringParameters.hasOwnProperty('tag')) {
  //
  //   // Get all tags with ids
  //   const
  //     segments = await getSegmentsWithId(), // "tags"
  //     segment = segments ? segments.filter( s => s.name === event.queryStringParameters.tag) : null, // Filter out all but the given tag
  //     email = await getEmailFromUUID(event.queryStringParameters.uuid);
  //
  //   if (!segment || !segment.length) {
  //     return badRequestResponse('No tag by that name');
  //   }
  //
  //   // If the user isn't a subscriber, add them.
  //   if (!await userIsASubscriber(email)) {
  //     try {
  //       const data = {
  //           email_address: email,
  //           tags: [segment[0].name],
  //           status: 'subscribed'
  //         };
  //       await axios.post( url + `/lists/${process.env.MC_AUDIENCE_ID}/members`, data, { headers: headers });
  //       return successResponse(true);
  //     } catch (e) {
  //       return internalServerErrorResponse(`postSubscriberAddTag: Create Subscriber Error - ${e}`);
  //     }
  //   }
  //
  //   try {
  //     await addTagToSubscriber(email, segment[0].id);
  //     return successResponse(true);
  //   } catch (e) {
  //     if (e.response && e.response.data && e.response.data.errors) {
  //       const errors = e.response.data.errors;
  //       for (let i = 0; i < errors.length; i++) {
  //         if (errors[i].message === 'Email is not subscribed to the list') { // The user is a subscriber and has the Unsubscribed status.
  //           if (await changeSubscriberStatus(email, 'subscribed')) {
  //
  //             try {
  //               await addTagToSubscriber(email, segment[0].id);
  //               return successResponse(true);
  //             } catch (e) {
  //               return internalServerErrorResponse(`Couldn't add user to list.`);
  //             }
  //
  //           } else {
  //             return internalServerErrorResponse(`Couldn't change the users status to subscribed.`);
  //           }
  //         } else {
  //           return internalServerErrorResponse(`Something went wrong.`);
  //         }
  //       }
  //     }
  //
  //     return internalServerErrorResponse(`Something went wrong.`);
  //   }
  // } else {
  //   return badRequestResponse('Please supply the tag name');
  // }
};

/**
 *
 * Removes a tag to a subscriber
 *
 * @params { tag: string }
 * @returns { boolean }
 *
 */
export const deleteSubscriberRemoveTag: Handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  if (event.queryStringParameters.hasOwnProperty('tag')) {
    try {
      const
        segments = await getSegmentsWithId(), // "tags"
        segment = segments.filter( s => s.name === event.queryStringParameters.tag), // Filter out all but the given tag
        email = await getEmailFromUUID(event.queryStringParameters.uuid);

      await axios.delete(url + `/lists/${process.env.MC_AUDIENCE_ID}/segments/${segment[0].id}/members/${hashEmail(email)}`, { headers: headers });

      return successResponse(true);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.detail === 'Member does not belong to the static segment.') {
        return successResponse(false);
      } else {
        return internalServerErrorResponse(`An error has occurred - ${e}`);
      }
    }
  } else {
    return badRequestResponse('Please supply a tag name.');
  }
};

/**
 *
 * Returns a list of Mailchimp "lists" Audiences, use this to get the ID.
 *
 */
// export const getLists: Handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
//   try {
//     const response = await axios.get(url + 'lists', { headers: headers });
//     return successResponse(response.data);
//   } catch (e) {
//     return badRequestResponse(error.response.data);
//   }
// };

const addTagToSubscriber = async (email: string, tagID: string): Promise<boolean> => {
  try {
    await axios.post(url + `/lists/${process.env.MC_AUDIENCE_ID}/segments/${tagID}/members`, { email_address: email }, { headers: headers });
    return true;
  } catch (e) {
    console.log('addTagToSubscriber', e.response.data);
    throw e;
  }
};

/**
 *
 * Changes the subscribers status to the string provided
 *
 * Possible Values:
 * subscribed
 * unsubscribed
 * cleaned
 * pending
 * transactional
 *
 * @param email { string }
 * @param status { string }
 */
const changeSubscriberStatus = async (email: string, status: string): Promise<boolean> => {
  try {
    await axios.put(url + `/lists/${process.env.MC_AUDIENCE_ID}/members/${hashEmail(email)}`, { status: 'subscribed' }, { headers: headers });
    return true;
  } catch (e) {
    throw e;
  }
};
/**
 * Checks to see if the user is in the list or not, Mailchimp returns a 404 if not.
 *
 * @param email { string }
 * @returns { boolean }
 */
const userIsASubscriber = async (email: string): Promise<boolean> => {
  try {
    await axios.get(url + `/lists/${process.env.MC_AUDIENCE_ID}/members/${hashEmail(email)}`, {headers: headers});
    return true;
  } catch (e) {
    return false;
  }
};
/**
 *
 * Gets a list of Segments (Tags) with their ID, we don't want to expose ID's to the public as they could unsub anyone.
 *
 * @returns { {id: string, name: string}[] }
 *
 */
const getSegmentsWithId = async (): Promise< { id: string, name: string }[] | null > => {
  try {
    const response = await axios.get(url + `/lists/${process.env.MC_AUDIENCE_ID}/segments`, { headers: headers });
    return response.data.segments.map( tag => ({
      id: tag.id,
      name: tag.name
    }));
  } catch (e) {
    return null;
  }
};
/**
 *
 * The MD5 hash of the lowercase version of the list member’s email address.
 *
 * Lowercase is a requirement of Mailchip.
 *
 * @returns { string } MD5 of the supplied email.
 */
const hashEmail = (email: string): string => {
  return crypto.createHash('md5').update(email).digest('hex').toLowerCase();
};
