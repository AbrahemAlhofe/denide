const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const fs = require('fs');
const entries = require('../entries')('entry')

// Plugins
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader')

const isProduction = true

const options = {
  mode : 'development',
  entry : entries,
  module : {
    rules : [
     //  {
     //   enforce : 'pre',
     //   test: /\.js$/,
     //   exclude: /node_modules/,
     //   loader: 'eslint-loader',
     //   options : {
     //     fix : true
     //   }
     // },
     {
       test: /\.js$/,
       exclude: /(node_modules|bower_components)/,
       use : {
         loader : 'babel-loader',
         options: {
           presets: ['@babel/preset-env'],
           plugins: ["@babel/plugin-transform-regenerator"]
         }
       }
     },
     {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.vue/i,
        loader: 'vue-loader',
        include : [ process.cwd() ],
        options: {
          extractCSS : isProduction
        }
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
       test: /\.css$/i,
       use: [ !isProduction ? 'vue-style-loader' : MiniCssExtractPlugin.loader, 'css-loader' ]
      }
    ]
  },
  resolve: {
    extensions: [ '.js', '.vue' ],
    alias: {
      '@': path.resolve(process.cwd())
    }
  },
  plugins : [
    new CopyPlugin([
      { from: './static' }
    ]),
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
}

const front = Object.assign({
  target : 'web',
  output : {
    filename : './front/[name].js',
    path : `${process.cwd()}/dist`
  }
}, options)


const back = Object.assign({
  target : 'node',
  output : {
    filename : './back/[name].js',
    libraryTarget: 'commonjs',
    path : `${process.cwd()}/dist`
  },
  externals: [nodeExternals()]
}, options)

module.exports = [ front, back ]
