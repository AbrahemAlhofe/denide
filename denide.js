const { mergeAndConcat } = require('merge-anything')
const { createDenideFolder, getCompilers, classifyPlugins, generateRoutes } = require('./utils')
const path = require('path');

class Denide {
  constructor (config) {
    // merge config with default options
    this.config = mergeAndConcat({
      isProd : true,
      link : [],
      routes : {},
      script : [],
      routerMiddlewares : [],
      serverMiddleware : {},
      port : 3000
    }, config)

    // classify plugins
    this.config.plugins = classifyPlugins( this.config.plugins )

    createDenideFolder({
      'router.js' : {
        routes : generateRoutes( this.config.routes )
      },
      'App.js' : {
        plugins : this.config.plugins
      },
      'render.js' : {
        routes : generateRoutes( this.config.routes )
      },
      'utils.js' : {
        middlewares : this.config.routerMiddlewares
      }
    })

  }

  bundler () {
      global.isFirstTime = true
      return Promise.all( getCompilers( require('./webpack.config'), global.isFirstTime ) ).then((stats) => {
          global.isFirstTime = false
          this.render = require( path.resolve( process.cwd(), './.denide/render') )( this.config )
          return stats
      })
  }

}

module.exports = Denide
