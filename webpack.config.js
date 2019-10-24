// @ts-check
const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || "development",
  devtool: 'inline-source-map',
  entry: './app/scripts/background.ts',
  output: {
    path: path.join(__dirname, "app", "dist"),
    filename: 'background.js'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  },
  plugins: []
}
