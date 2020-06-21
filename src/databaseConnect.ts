import { IMain, IDatabase } from 'pg-promise';
import pgPromise from 'pg-promise';
const options = {
    query: (e: any) => { // tslint:disable-line no-any
        console.log('QUERY:', e.query);
        if (e.params) {
            console.log('PARAMS:', e.params);
        }
    }
};
export const pgp: IMain = pgPromise(options);
const cn = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: (process.env.PGSSL === 'true')
} as any; // tslint:disable-line no-any

export const db: IDatabase<any> = pgp(cn); // tslint:disable-line no-any
