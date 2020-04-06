const { mergeAndConcat } = require('merge-anything')
const { createDenideFolder, getCompilers, classifyPlugins } = require('./utils')

class Denide {
  constructor (config) {
    // merge config with default options
    this.config = mergeAndConcat({
      isProd : true,
      link : [],
      routes : {},
      script : [],
      port : 3000
    }, config)

    this.render = require('./.denide/render')( this.config )

    // classify plugins
    this.config.plugins = classifyPlugins( this.config.plugins )

    createDenideFolder({
      'router.js' : {
        routes : JSON.stringify(this.config.routes)
      },
      'App.js' : {
        plugins : this.config.plugins
      }
    })

  }

  bundler () {
      global.isFirstTime = true

      return Promise.all( getCompilers( require('./webpack.config'), global.isFirstTime ) ).then((stats) => {
        global.isFirstTime = false
        return stats
      })
  }

}

module.exports = Denide
