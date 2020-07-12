const { mergeAndConcat } = require('merge-anything')
const { createDenideFolder, getCompilers, classifyPlugins, generateRoutes } = require('./utils')
const path = require('path');


/*
 - remove send package from 'uiliue'
 - add compression pacakge
*/
class Denide {
  constructor (config) {
    // merge config with default options
    this.config = mergeAndConcat({
      isProd : true,
      link : [],
      routes : {},
      script : [],
      sassLoader : {
        globalFile : ""
      },
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
      'render.js' : {
        routes : generateRoutes( this.config.routes )
      },
      'entry-client.js' : {
        plugins : this.config.plugins,
        middlewares : this.config.routerMiddlewares.map(middleware => {
          middleware.path = path.resolve( process.cwd(), middleware.path ).replace(/\\/g, '/')
          return middleware
        })
      },
      'entry-server.js' : {
        plugins : this.config.plugins,
        middlewares : this.config.routerMiddlewares.map(middleware => {
          middleware.path = path.resolve( process.cwd(), middleware.path ).replace(/\\/g, '/')
          return middleware
        })
      }
    })

    this.render = require( path.resolve( process.cwd(), './.denide/render') )( this.config )
  }

  bundler () {
      global.isFirstTime = true
      return Promise.all( getCompilers( require('./webpack.config')(this.config), global.isFirstTime ) ).then((stats) => {
          global.isFirstTime = false
          this.render = require( path.resolve( process.cwd(), './.denide/render') )( this.config )
          return stats
      })
  }

}

module.exports = Denide
