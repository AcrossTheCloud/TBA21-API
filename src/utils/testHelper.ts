import { QueryFile } from 'pg-promise';
import { db } from '../databaseConnect';

const loadSQLFile = (file: string): QueryFile => {
  return new QueryFile(process.cwd() + file, { minify: true });
};

const schema = loadSQLFile('/schema/schema.sql');
const collections = loadSQLFile('/schema/seeds/1.collections.sql');
const conceptTags = loadSQLFile('/schema/seeds/4.conceptTags.sql');
const keywordTags = loadSQLFile('/schema/seeds/5.keywordTags.sql');
const items = loadSQLFile('/schema/seeds/6.items.sql');
const collectionsItems = loadSQLFile('/schema/seeds/7.collectionsItems.sql');
const profile = loadSQLFile('/schema/seeds/8.profile.sql');

export const reSeedDatabase = async () => {
  await db.task(async t => {
    await t.any(`DROP SCHEMA IF EXISTS tba21 CASCADE;`);
    await t.none(schema);
    await t.none(collections);
    await t.none(conceptTags);
    await t.none(keywordTags);
    await t.none(items);
    await t.none(collectionsItems);
    await t.none(profile);
  });
};
