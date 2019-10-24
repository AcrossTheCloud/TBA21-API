import { db } from '../databaseConnect';

/**
 * Converts GeoJSON into an array of features, POINT LINESTRING etc
 * @param geoData
 */
export const geoJSONToGeom = async (geoData): Promise<string[]> => {
  const geoResult = await db.many(`
      WITH data AS (SELECT '${JSON.stringify(geoData)}'::json AS fc)
      SELECT
        ST_AsText(ST_GeomFromGeoJSON(feat->>'geometry')) AS geom
      FROM (
        SELECT json_array_elements(fc->'features') AS feat
        FROM data
      ) AS f;
    `);

  return geoResult.map(e => e.geom);
};
