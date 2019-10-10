import * as dbgeo from 'dbgeo';

/* set up dbgeo defaults
 * outputFormat: all the goodness of topojson
 * geometryType: wkt corresponds to ST_AsText
 * geometryColumn: the column to process, 'geom'
 */

dbgeo.defaults = {
  outputFormat: 'topojson',
  geometryColumn: 'geom',
  geometryType: 'wkt',
  precision: null,
  quantization: null
}

export const dbgeoparse = function(input, params) {
  return new Promise((resolve, reject) => {
    dbgeo.parse(input, params, (err, output) => {
      if (err) reject(err)
      else resolve(output);
    });
  })
}

