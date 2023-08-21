// const webpack = require('webpack');
const { merge } = require('webpack-merge');
const config = require('./webpack.config');

module.exports = merge(config, {
  mode: 'development',
  devtool: 'inline-cheap-module-source-map',
  // devServer: {
  //   devMiddleware: {
  //     writeToDisk: true,
  //   },
  //   // disableHostCheck: true,
  //   // host: '0.0.0.0',
  //   // hot: true,
  //   port: 3000,
  //   proxy: {
  //     // Proxy all /xapi requests through gateway
  //     '/xapi': {
  //       headers: {
  //         'X-Forwarded-For': '127.0.0.1',
  //         'Xapi-Auth-Org-Id': 1,
  //         'Xapi-Auth-User-Id': '2568',
  //         'Xapi-Auth-User-Uuid': '816355CA08CE409A8BAC9E9AFB51C362',
  //         'Xapi-OAuth-Client-Id': 'ExperticityWeb',
  //       },
  //       target: 'http://gateway-xapi.service.dev5.consul:6011',
  //     },
  //   },
  //   static: {
  //     directory: './build',
  //   },
  // },
});
