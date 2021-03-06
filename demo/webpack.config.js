const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  target: 'web',
  context: __dirname,
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
  },
  output: {
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: ['ts-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/index.html',
          transform: (content) => content.toString().replace('%PUBLIC_URL%', process.env.PUBLIC_URL || ''),
        },
      ],
    }),
  ],

  devtool: 'source-map',
  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    contentBase: path.join(__dirname, 'dist'),
    index: 'index.html',
  },
};
