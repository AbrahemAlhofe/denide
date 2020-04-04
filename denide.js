const { mergeAndConcat } = require('merge-anything')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack');
const { createDirectoryContents } = require('./.denide/utils')
var isFirstTime = true

function createDenideFolder(options) {
  if ( !fs.existsSync(path.resolve(process.cwd(), './.denide')) ) {
    fs.mkdirSync( path.resolve( process.cwd(), './.denide' ) )
  }

  createDirectoryContents( path.resolve(__dirname, './.denide'), path.resolve(process.cwd(), './.denide'), options)
}

class Denide {
  constructor (config) {
    this.isProd = true

    // merge config with default options
    this.config = mergeAndConcat({
      mode : this.isProd ? 'production' : 'development',
      link : [],
      routes : {},
      script : [],
      port : 3000
    }, config)

    this.render = require('./.denide/render')( this.config )

    this.config.plugins = this.config.plugins.map( plugin => {
      if ( typeof plugin === 'string' ) {
        plugin = { src : plugin, mode : 'ssr' }
      }

      if ( typeof plugin === 'object' ) {
        plugin = Object.assign({ src : plugin.src, mode : 'ssr' }, plugin)
      }
      return plugin
    })

    const options = {
      'router.js' : {
        routes : JSON.stringify(this.config.routes)
      },
      'App.js' : {
        plugins : {
          client : this.config.plugins.filter( plugin => plugin.mode === 'client' ),
          ssr : this.config.plugins.filter( plugin => plugin.mode === 'ssr' )
        }
      }
    }

    createDenideFolder(options)
  }

  bundler () {
      const compiler = webpack( require('./webpack.config') )

      return new Promise((resolve) => {
        // build and watch entries files
        compiler.watch({}, (_, stats) => {
          // if is there error stop process
          if ( stats.hasErrors() ) {
            process.stdout.write(stats.toString() + '\n');
          }

          // if it is not first time file run
          if ( !isFirstTime ) {
            // re write server file to make nodmon reload server
            const serverPath = path.resolve(process.cwd(), './server/index.js')
            const content = fs.readFileSync( serverPath )
            fs.writeFileSync( serverPath, content, 'utf-8')
          }

          isFirstTime = false

          resolve(stats)
        });
      })
  }

}

module.exports = Denide
