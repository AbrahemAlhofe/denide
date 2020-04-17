const nodeExternals = require('webpack-node-externals');
const entries = require('./.denide/entries')('entry')
const path = require('path')

// Plugins
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const { mergeAndConcat } = require('merge-anything')

const isProduction = process.env.NODE_ENV === 'production'

const options = {
  mode : isProduction ? 'production' : 'development',
  entry : entries,
  module : {
    rules : [
     {
        test: /\.pug$/,
        loader: 'pug-plain-loader'
     },
     {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          { loader : 'sass-loader',
            options : {
              prependData : `@import "@/assets/scss/colors.scss"; `
            }
          }
        ]
      },
      {
        test: /\.vue/i,
        loader: 'vue-loader',
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
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      }
    ]
  },
  resolve: {
    extensions: [ '.js', '.vue' ],
    alias: {
      '@': process.cwd()
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

const front = mergeAndConcat({
  target : 'web',
  entry : {
    'entry-client' : './.denide/entry-client.js'
  },
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  output : {
    filename : './front/[name].js'
  }
}, options)


const back = mergeAndConcat({
  target : 'node',
  entry : {
    'entry-server' : './.denide/entry-server.js'
  },
  output : {
    filename : './back/[name].js',
    libraryTarget: 'commonjs'
  },
  externals: [nodeExternals()]
}, options)

module.exports = [ front, back ]
