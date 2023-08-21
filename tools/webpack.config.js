const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  devtool: 'source-map',
  entry: {
    // devtools: path.join(__dirname, 'src', 'Devtools', 'index.js'),
    // options: path.join(__dirname, 'src', 'Options', 'index.jsx'),
    // panel: path.join(__dirname, 'src', 'Panel', 'index.jsx'),
    content: './src/content/index.jsx',
    // popup: './src/popup/index.jsx',
    worker: '/src/worker.js',
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, '../build'),
    clean: true,
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'source-map-loader',
          },
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(css|less)$/,
        exclude: /.*\.shadow\.(css|less)/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /.*\.shadow\.(css|less)/i,
        use: [
          {
            loader: 'css-loader',
            options: {
              exportType: 'css-style-sheet',
            },
          },
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        include: /assets/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[name].[contenthash][ext][query]',
        },
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: false }),
    new CopyWebpackPlugin({
      patterns: [{
        from: 'src/manifest.json',
        to: './',
        force: true,
        // generates the manifest file using the package.json information
        transform: (content) => Buffer.from(
          JSON.stringify({
            description: process.env.npm_package_description,
            version: process.env.npm_package_version,
            ...JSON.parse(content.toString()),
          }, null, 2),
        ),
      }, {
        from: './src/assets/fonts',
        to: './assets/fonts',
        force: true,
      }, {
        from: './src/assets/images',
        to: './assets/images',
        force: true,
      }],
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
    }),
    // new HtmlWebpackPlugin({
    //   template: './src/popup/index.html',
    //   filename: 'popup.html',
    //   chunks: ['popup'],
    //   cache: false,
    // }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  infrastructureLogging: {
    level: 'info',
  },
  stats: {
    errorDetails: true,
  },
};
