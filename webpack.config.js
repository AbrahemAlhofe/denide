const nodeExternals = require('webpack-node-externals');
const entries = require('./.denide/entries')('entry')
const path = require('path')

// Plugins
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production'

const options = {
  mode : isProduction ? 'production' : 'development',
  entry : entries,
  optimization: {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
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

const front = Object.assign({
  target : 'web',
  output : {
    filename : './front/[name].js'
  }
}, options)


const back = Object.assign({
  target : 'node',
  output : {
    filename : './back/[name].js',
    libraryTarget: 'commonjs'
  },
  externals: [nodeExternals()]
}, options)

module.exports = [ front, back ]
