import { QueryFile } from 'pg-promise';
import { db } from '../databaseConnect';

const loadSQLFile = (file: string): QueryFile => {
  return new QueryFile(process.cwd() + file, { minify: true });
};

const schema = loadSQLFile('/schema/schema.sql');
const collections = loadSQLFile('/schema/seeds/01.collections.sql');
const conceptTags = loadSQLFile('/schema/seeds/04.conceptTags.sql');
const keywordTags = loadSQLFile('/schema/seeds/05.keywordTags.sql');
const items = loadSQLFile('/schema/seeds/06.items.sql');
const collectionsItems = loadSQLFile('/schema/seeds/07.collectionsItems.sql');
const collectionsCollections = loadSQLFile('/schema/seeds/07.collectionsCollections.sql');
const profiles = loadSQLFile('/schema/seeds/08.profiles.sql');
const shortPaths = loadSQLFile('/schema/seeds/09.shortPaths.sql');
const announcements = loadSQLFile('/schema/seeds/10.announcements.sql');

export const reSeedDatabase = async () => {
  await db.task(async t => {
    await t.any(`DROP SCHEMA IF EXISTS tba21 CASCADE;`);
    await t.none(schema);
    await t.none(collections);
    await t.none(conceptTags);
    await t.none(keywordTags);
    await t.none(items);
    await t.none(collectionsItems);
    await t.none(collectionsCollections);
    await t.none(profiles);
    await t.none(shortPaths);
    await t.none(announcements);
  });
};
