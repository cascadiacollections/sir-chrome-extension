// @ts-check
const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv && argv.mode === 'production';
  
  return {
    mode: (argv && argv.mode) || 'development',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
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
      minimize: isProduction,
    },
    plugins: [],
  };
};
