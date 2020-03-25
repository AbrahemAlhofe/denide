const { mergeAndConcat } = require('merge-anything')
const webpack = require('webpack');
const fs = require('fs')
const path = require('path')
var isFirstTime = true

class Denide {
  constructor (config) {
    this.isProd = true

    // merge config with default options
    this.config = mergeAndConcat({
      mode : this.isProd ? 'production' : 'development',
      link : [],
      script : [],
      port : 3000
    }, config)

    // init render middleware
    this.render = require('./render.js')(this.config)
  }

  bundler () {
    // init webpack compiler
    const compiler = webpack(require('./webpack.config.js'))

    return new Promise((resolve, reject) => {
      // build and watch entries files
      compiler.watch({}, (err, stats) => {
        // if is there error stop process
        if (err) { reject(err); return }

        // if it is not first time file run
        if ( !isFirstTime ) {
          // re write server file to make nodmon reload server
          const serverPath = path.resolve(process.cwd(), './server/index.js')
          const content = fs.readFileSync( serverPath )
          fs.writeFileSync( serverPath, content, 'utf-8')
        }
        resolve(stats)
        isFirstTime = false
      });

    })
  }
}

module.exports = Denide
