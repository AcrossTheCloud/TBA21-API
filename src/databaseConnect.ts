import { IMain, IDatabase } from 'pg-promise';
import pgPromise from 'pg-promise';

const pgp: IMain = pgPromise();
const cn: string = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export const db: IDatabase<any> = pgp(cn); // tslint:disable-line no-any
