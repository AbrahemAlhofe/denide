const nodeExternals = require('webpack-node-externals');
const entries = require('./.denide/entries')('entry')
const path = require('path')
const webpack = require('webpack')

// Plugins
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const { mergeAndConcat } = require('merge-anything')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = function getBundlersConfig (config) {
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
                prependData : `@import "${config.sassLoader.globalFile}"; `
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
          test: /\.svg/i,
          use: 'raw-loader',
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
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
      usedExports: true,
      splitChunks: {
        cacheGroups: {
          commons : { test : /[\\/]node_modules[\\/]/, name : 'common', chunks : 'all' }
        }
      },
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    output : {
      filename : './front/[name].js'
    },
    plugins: [
      // new BundleAnalyzerPlugin()
    ]
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

  return [ front, back ]
}
