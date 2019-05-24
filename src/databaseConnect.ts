import { IMain, IDatabase } from 'pg-promise';
import pgPromise from 'pg-promise';

import config from './dev-config';

const pgp: IMain = pgPromise();
const cn: string = `postgres://${config.database.USERNAME}:${config.database.PASSWORD}@${config.database.HOST}:${config.database.PORT}/${config.database.DATABASE}`;

export const db: IDatabase<any> = pgp(cn); // tslint:disable-line no-any
