import 'reflect-metadata'; // tslint:disable-line no-import-side-effect ordered-imports (TypeORM request reflect-metadata to be loaded at entry point of the app, like this.)
import { APIGatewayEvent, Context } from 'aws-lambda';
import { Connection, ConnectionOptions, getConnectionManager } from 'typeorm';
import { badRequestResponse } from './common';
import connectionOptions from './connectionOptions.json';

import { getItems } from './items/items';

let connectionManager = getConnectionManager();
let pgConnection: Connection;

export const handler = async (event: APIGatewayEvent, context: Context) => {

  try {
    // Check if we have an already existing DB connection
    if (connectionManager.has('default')) {
      pgConnection = await connectionManager.get('default');
      console.log('REUSING SAME CONNECTION');
    } else {
      pgConnection = await connectionManager.create({ ...connectionOptions as ConnectionOptions });
      console.log('GETTING A NEW CONNECTION');
    }

    if (!pgConnection.isConnected) {
      await pgConnection.connect();
    }

    switch (event.path) {
      case '/items/getItems':
        return await getItems(pgConnection, event.queryStringParameters);
        break;

      default:
        return badRequestResponse;
    }

  } catch (e) {
    console.log('______________________________________________________________________', e);
    return badRequestResponse;
  }

};
