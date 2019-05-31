import { IMain, IDatabase } from 'pg-promise';
import pgPromise from 'pg-promise';

const pgp: IMain = pgPromise();
const cn: string = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

export const db: IDatabase<any> = pgp(cn); // tslint:disable-line no-any
