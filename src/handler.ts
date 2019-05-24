// import {IMain, IDatabase} from 'pg-promise';
// import pgPromise from 'pg-promise';

import { APIGatewayEvent, Context } from 'aws-lambda';
import { badRequestResponse } from './common';

import { getItems } from './items/items';
// import config from './config.js';

// const pgp: IMain = pgPromise();
// const cn: string = `postgres://${config.database.USERNAME}:${config.database.PASSWORD}@${config.database.HOST}:${config.database.PORT}/${config.database.DATABASE}`;
// const db: IDatabase<any> = pgp(cn);

export const handler = async (event: APIGatewayEvent, context: Context) => {

  try {
    switch (event.path) {
      case '/items/getItems':
        return await getItems(event.queryStringParameters);
        break;

      default:
        return badRequestResponse;
    }

  } catch (e) {
    return badRequestResponse;
  }

};
