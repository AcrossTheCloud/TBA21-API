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
    return `Error getting cognito user.`;
  }
};

export const changeS3ProtectionLevel = async (key: string, level: 'private' | 'public-read'): Promise<boolean> => {
  try {
    const s3 = new AWS.S3({apiVersion: '2006-03-01'});

    await s3.putObjectAcl({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ACL: level
    }).promise();

    return true;
  } catch (e) {
    return false;
  }
};
