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
    console.log('getSegments: ', e);
    return internalServerErrorResponse('MC0001');
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
      console.log('getSubscriberTags: ', e);
      return internalServerErrorResponse('MC0002');
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
  if (event.hasOwnProperty('body')) {
    const queryStringParameters = JSON.parse(event.body);

    // Get all tags with ids
    const
      segments = await getSegmentsWithId(), // "tags"
      segment = segments ? segments.filter( s => s.name === queryStringParameters.tag) : null, // Filter out all but the given tag
      email = await getEmailFromUUID(queryStringParameters.uuid);

    // No tags at all? Fail
    if (!segments || !segments.length) { return badRequestResponse('No segments'); }
    // If we don't find the users email from their UUID, fail
    if (email === 'Error getting cognito user.') { return internalServerErrorResponse('We had an issue processing your request. (MC003)'); }
    // If there's no tag that has the name of the supplied tag, fail
    if (!segment || !segment.length) { return badRequestResponse('No tag by that name'); }

    // If the user isn't a subscriber, add them.
    if (!await userIsASubscriber(email)) {
      try {
        const data = {
          email_address: email,
          tags: [segment[0].name],
          status: 'subscribed'
        };
        await axios.post( url + `/lists/${process.env.MC_AUDIENCE_ID}/members`, data, { headers: headers });
        return successResponse(true);
      } catch (e) {
        console.log('postSubscriberAddTag: ', e);
        return internalServerErrorResponse(`We've had an issue processing your request. (MC0004)`);
      }
    }

    try {
      // Add tag to the user, if they already exist.
      await addTagToSubscriber(email, segment[0].id);
      return successResponse(true);
    } catch (e) {
      if (e.response && e.response.data && e.response.data.errors) {
        const errors = e.response.data.errors;
        for (let i = 0; i < errors.length; i++) {
          if (errors[i].message === 'Email is not subscribed to the list') { // The user is a subscriber and has the Unsubscribed status.
            if (await changeSubscriberStatus(email, 'subscribed')) {

              try {
                await addTagToSubscriber(email, segment[0].id);
                return successResponse(true);
              } catch (e) {
                console.log('postSubscriberAddTag: ', e);
                return internalServerErrorResponse(`We had trouble updating your preferences. (MC0005)`);
              }

            } else {
              console.log('postSubscriberAddTag: ', e);
              return internalServerErrorResponse(`We had trouble processing your request. (MC0006)`);
            }
          } else {
            console.log('postSubscriberAddTag: ', e);
            return internalServerErrorResponse(`Something went wrong. (MC0007)`);
          }
        }
      }
      // No error matched what we expected, fail.
      console.log('postSubscriberAddTag: ', e);
      return internalServerErrorResponse(`Something went wrong. (MC0008)`);
    }

  } else {
    return badRequestResponse('Please supply the tag name');
  }
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
    const
      segments = await getSegmentsWithId(), // "tags"
      segment = segments.filter( s => s.name === event.queryStringParameters.tag), // Filter out all but the given tag
      email = await getEmailFromUUID(event.queryStringParameters.uuid);

    try {
      await axios.delete(url + `/lists/${process.env.MC_AUDIENCE_ID}/segments/${segment[0].id}/members/${hashEmail(email)}`, { headers: headers });

      return successResponse(true);
    } catch (e) {
      if (e.response && e.response.data) {
        if (e.response.data.detail === 'Member does not belong to the static segment.') {
          return successResponse(false);
        }
        if (e.response.data.detail === 'Member is not subscribed to the list.') {
          return successResponse('User is unsubscribed.');
        }
        if (e.response.data.errors) {
          const errors = e.response.data.errors;
          for (let i = 0; i < errors.length; i++) {
            if (errors[i].message === 'Email is not subscribed to the list') { // The user is a subscriber and has the Unsubscribed status.
              if (await changeSubscriberStatus(email, 'subscribed')) {

                try {
                  await addTagToSubscriber(email, segment[0].id);
                  return successResponse(true);
                } catch (e) {
                  console.log('deleteSubscriberRemoveTag: ', e);
                  return internalServerErrorResponse(`We had trouble processing your request. (MC0008)`);
                }

              } else {
                console.log('deleteSubscriberRemoveTag: ', e);
                return internalServerErrorResponse(`We had trouble processing your request. (MC0009)`);
              }
            } else {
              console.log('deleteSubscriberRemoveTag: ', e);
              return internalServerErrorResponse(`We've had a bit of an issue. (MC0010)`);
            }
          }
        }
        // No error matched what we expected, fail.
        console.log('deleteSubscriberRemoveTag: ', e);
        return internalServerErrorResponse(`Something went wrong. (MC0011)`);
      }
      console.log('deleteSubscriberRemoveTag: ', e);
      return internalServerErrorResponse(`Something went wrong. (MC0011)`);
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
    console.log('addTagToSubscriber: ', e.response.data);
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
    console.log('changeSubscriberStatus: ', e);
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
    console.log('userIsASubscriber: ', e);
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
    console.log('getSegmentsWithId: ', e);
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
