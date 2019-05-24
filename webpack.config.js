const path = require('path');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const webpack = require('webpack');
const slsw = require('serverless-webpack');

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.json', '.ts'],
  },

  optimization: { minimize: false },

  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          reportFiles: ['!src/entity/*.ts']
        },
        exclude: /node_modules/
      },
    ],
  },
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/),
    //ignore the drivers you don't want. This is the complete list of all drivers -- remove the suppressions for drivers you want to use.
    new FilterWarningsPlugin({
      exclude: [/react-native-sqlite-storage/, /sql.js/, /mongodb/, /mssql/, /mysql/, /mysql2/, /oracledb/, /pg-native/, /pg-query-stream/, /redis/, /sqlite3/]
    })
  ]
};
