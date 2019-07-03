import { QueryFile } from 'pg-promise';
import { db } from '../databaseConnect';

const loadSQLFile = (file: string): QueryFile => {
  return new QueryFile(process.cwd() + file, {minify: true});
};

const schema = loadSQLFile('/schema/schema.sql');
const collections = loadSQLFile('/schema/seeds/1.collections.sql');
const types = loadSQLFile('/schema/seeds/3.types.sql');
const conceptTags = loadSQLFile('/schema/seeds/4.conceptTags.sql');
const keywordTags = loadSQLFile('/schema/seeds/5.keywordTags.sql');
const items = loadSQLFile('/schema/seeds/6.items.sql');
const collectionsItems = loadSQLFile('/schema/seeds/7.collectionsItems.sql');

export const reSeedDatabase = async () => {
  // Wrapped in a task to prevent performance / locking
  await db.task('Reseed DB', async () => {
    await db.query(`DROP SCHEMA IF EXISTS tba21 CASCADE;`);

    await db.none(schema);
    await db.none(collections);
    await db.none(types);
    await db.none(conceptTags);
    await db.none(keywordTags);
    await db.none(items);
    await db.none(collectionsItems);
    return;
  });
};
