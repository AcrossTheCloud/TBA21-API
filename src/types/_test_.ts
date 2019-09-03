export interface QueryStringParameters { [name: string]: string; }
export interface MultiQueryStringParameters { [name: string]: string[]; }

export const requestContext = {
  authorizer: {
    claims: {
      'cognito:username': '81d16d9b-e7da-4d6e-aa13-176820851491'
    }
  },
  identity: {
    cognitoAuthenticationProvider: 'SomeHugeStringFromLambda:CognitoSignIn:81d16d9b-e7da-4d6e-aa13-176820851491'
  }
};
