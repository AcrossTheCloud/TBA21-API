const awsXRay = require('aws-xray-sdk');
const AWS = awsXRay.captureAWS(require('aws-sdk'));

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
        Username: uuid,
        UserPoolId: process.env.USER_POOL_ID
      },
      user = await cognitoidentityserviceprovider.adminGetUser(params).promise(),
      userAttributes = user.UserAttributes.filter(a => a.Name === 'email');

    if (!userAttributes[0]) {
      throw 'We could not find your email address in our system.';
    }

    return userAttributes[0].Value;

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
