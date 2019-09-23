const path = require('path')
const merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
// const BundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const common = require('./webpack.conf.common')
const entry = require('./buildEntry')

const allEntry = {
  index: path.join(__dirname, '../src/index.js')
}

const isAll = process.env.CHART_TYPE === 'all'

module.exports = merge(common, {
  entry: isAll ? allEntry : entry,
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, isAll ? '../lib' : '../lib/modules'),
    filename: '[name].js',
    library: '[name]',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  optimization: {
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
      minChunks: 2,
      name: 'qcharts.core',
      maxInitialRequests: 5
    }
  },
  externals: {
    spritejs: {
      root: 'spritejs',
      commonjs2: 'spritejs/dist/spritejs.min.js',
      commonjs: 'spritejs/dist/spritejs.min.js',
      amd: 'spritejs',
      umd: 'spritejs'
    }
  }
  // plugins: [new BundleAnalyzer()]
})
