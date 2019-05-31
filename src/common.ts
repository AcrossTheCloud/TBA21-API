import { APIGatewayProxyResult } from 'aws-lambda';

export const headers = {
  'Access-Control-Allow-Origin' : '*', // Required for CORS support to work
  'Access-Control-Allow-Credentials' : true // Required for cookies, authorization headers with HTTPS
};

export const badRequestResponse = (message?: string): APIGatewayProxyResult => ({
  body: JSON.stringify({message: (message ? message : 'Bad request, invalid query parameter.')}),
  headers: headers,
  statusCode: 400
});
