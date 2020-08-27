import * as dbgeo from 'dbgeo';
import { TopoJSON } from 'topojson-specification';

/* set up dbgeo defaults
 * outputFormat: all the goodness of topojson
 * geometryType: wkt corresponds to ST_AsText
 * geometryColumn: the column to process, 'geom'
 */

const defaults = {
  outputFormat: 'topojson',
  geometryColumn: 'geom',
  geometryType: 'wkt',
  precision: null,
  quantization: null
};

interface DbGeoParams {
  outputFormat?: string;
  geometryColumn?: string;
  geometryType?: string;
  precision?: number | null;
  quantization?: number | null;
}

export const dbgeoparse = function(input: any, params: DbGeoParams) { // tslint:disable-line:no-any
  return new Promise((resolve, reject) => {
    dbgeo.parse(input, params ? params : defaults, (err: string, output: TopoJSON) => { 
      if (!input) {
        console.log(input);
        resolve(null);
      }
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  });
};