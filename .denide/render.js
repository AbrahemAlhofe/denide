const path = require('path');
const { renderPage } = require('./utils');
const cookieParser = require('cookie-parser')
const express = require('express');
const app = express.Router();
const { mergeAndConcat } = require('merge-anything')
const rootPath = path.resolve(process.cwd())

app.use( cookieParser() )

module.exports = function (config) {
  app.use('/src', express.static( path.join(rootPath, '/dist') ))
  app.use('/assets', express.static( path.join(rootPath, '/assets') ))

  app.get('/page/:page', (req, res) => {
    const routes = require('./entries')('back')
    const page = require( path.resolve(rootPath, routes[req.params.page]) )

    const data = {
      head : {
        link : [{ rel : 'stylesheet', href : `/src/${ req.params.page }.css` }]
      },
      body : {
        script : [{ src : `/src/front/${ req.params.page }.js` }]
      }
    }

    res.send({ assets : mergeAndConcat(data, page.html || {}) })

  })

  const { routes, head, body } = config

  const middleware = (path, pagename) => (req, res) => {
    const context = { html : {} }

    context.html.head = mergeAndConcat(head, {
      link : [
        { rel : 'stylesheet', href : `/src/${ pagename }.css` },
        { rel : 'stylesheet', href : `/src/app.css`}
      ]
    })

    context.html.body = mergeAndConcat(body, {
      script : [
        { src : `/src/front/${ pagename }.js` },
        { src : '/src/front/app.js' }
      ]
    })

    console.log( req.url, path, pagename )

    renderPage(req, context, (template, assets) => {
      res.send(template)
    })
  }

  {{#routes}}
  app.get('{{{ path }}}', middleware('{{{ path }}}', '{{ pagename }}') )
  {{/routes}}

  app.use(config.serverMiddleware.path, require(
    path.resolve(rootPath, config.serverMiddleware.handler)
  ))

  return app
}
