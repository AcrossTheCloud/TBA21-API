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
const cn: string = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?ssl=${process.env.PGSSL}`;

export const db: IDatabase<any> = pgp(cn); // tslint:disable-line no-any
