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

export const unAuthorizedRequestResponse = (message?: string): APIGatewayProxyResult => ({
  body: JSON.stringify({message: (message ? message : 'You are not authorized to perform this action.')}),
  headers: headers,
  statusCode: 403
});

export const internalServerErrorResponse = (message?: string): APIGatewayProxyResult => ({
  body: JSON.stringify({message: (message ? message : 'Internal Server Error')}),
  headers: headers,
  statusCode: 500
});

export const successResponse = (data: any): APIGatewayProxyResult => ({ // tslint:disable-line no-any
  body: JSON.stringify(data),
  headers: headers,
  statusCode: 200
});
