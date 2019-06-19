const AWS = require('aws-sdk');

/**
 * Get the users email from their UUID on Cognito
 * @param uuid { string }
 * @returns { Promise<string> } The users email
 */
export const getEmailFromUUID = async (uuid: string): Promise<string> => {
  try {

    const
      cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider(),
      params = {
        AttributesToGet: [ 'email' ],
        Filter: `sub="${uuid}"`,
        Limit: 1,
        UserPoolId: process.env.USER_POOL_ID
      },
      user = await cognitoidentityserviceprovider.listUsers(params).promise();

    return user.Users[0].Attributes[0].Value;

  } catch (e) {
    throw new Error(`Error getting cognito user. ${e}`);
  }
};
