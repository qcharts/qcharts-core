const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const common = require('./webpack.conf.common')

const isDoc = process.env.DEV_MODE === 'doc'

module.exports = merge(common, {
  entry: {
    app: isDoc
      ? path.resolve(__dirname, '../demo/')
      : path.resolve(__dirname, '../demo/demo'),
    qcharts: path.resolve(__dirname, '../src/')
  },
  devServer: {
    contentBase: path.resolve(__dirname, '../src/'),
    compress: true,
    hot: false,
    inline: true,
    quiet: true,
    open: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 3000
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   enforce: 'pre',
      //   loader: 'eslint-loader',
      //   options: {
      //     failOnError: true,
      //     quiet: true
      //   },
      //   include: path.resolve(__dirname, '../src'),
      //   exclude: /node_modules/
      // },

      {
        test: /\.(s)?css$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },

      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 3000,
          name: 'static/img/[name].[ext]?[hash]'
        }
      },

      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 3000,
          name: 'static/fonts/[name].[hash].[ext]'
        }
      }
    ]
  },
  plugins: [
    // new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.WatchIgnorePlugin([/\.d\.ts$/]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../demo/index.html'),
      filename: 'index.html'
    })
  ]
})
