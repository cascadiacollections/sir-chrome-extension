// @ts-check
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool:
    process.env.NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  entry: {
    background: './app/scripts/background.ts',
  },
  output: {
    path: path.resolve(__dirname, 'app/dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
  },
  plugins: [],
};
