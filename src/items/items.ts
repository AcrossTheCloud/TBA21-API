import { APIGatewayEvent, Callback, Context, ProxyResult } from 'aws-lambda'; // tslint:disable-line no-implicit-dependencies (Using only the type information from the @types package.)

export const get = (event: APIGatewayEvent, context: Context, callback: Callback): void => {
  const response: ProxyResult = {
    body: JSON.stringify({
      input: event,
      message: 'stuff',
    }),
    statusCode: 200,
  };

  callback(undefined, response);
};
