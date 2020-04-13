const path = require('path');
const { renderPage } = require('./utils');
const cookieParser = require('cookie-parser')
const express = require('express');
const app = express.Router();

const json2html = require('./json2html')
const { JSDOM } = require('jsdom')
const { mergeAndConcat } = require('merge-anything')
const Renderer = require('vue-server-renderer').createRenderer

const { createApp } = require('../dist/back/app.js')

const rootPath = path.resolve(process.cwd())

app.use( cookieParser() )

module.exports = function (config) {
  const { routes, head, body } = config

  app.use('/src', express.static( path.join(rootPath, '/dist') ))
  app.use('/assets', express.static( path.join(rootPath, '/assets') ))

  app.get('/page/:page', (req, res) => {
    const page = require(`../dist/back/${req.params.page}`)

    const assets = mergeAndConcat({
      head : {
        link : [{ rel : 'stylesheet', href : `/src/${ req.params.page }.css` }]
      },
      body : {
        script : [{ src : `/src/front/${ req.params.page }.js` }]
      }
    }, page.html || {})

    res.send({ assets })
  })

  const middleware = (path, pagename) => (req, res) => {
    const context = {
      head : mergeAndConcat(head, {
        link : [
          { rel : 'stylesheet', href : `/src/${ pagename }.css` },
          { rel : 'stylesheet', href : `/src/app.css`}
        ]
      }),
      body : mergeAndConcat(body, {
        script : [
          { src : `/src/front/${ pagename }.js` },
          { src : '/src/front/app.js' }
        ]
      })
    }

    const ssr = Renderer({
      template (result, context) {
        const { document } = new JSDOM(result).window
        const { head, body } = context
        return `<html> ${ json2html({ head, body }, document).documentElement.innerHTML } </html>`
      }
    })

    const page = require(`../dist/back/${ pagename }.js`)
    const { app, router } = createApp(page)

    // set server-side router's location
    router.push(req.url)

    // wait until router has resolved possible async components and hooks
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()
      // no matched routes, reject with 404
      if (!matchedComponents.length) {
        next()
      }

      ssr.renderToString( app, mergeAndConcat(page.html, context), (err, html) => {
        if (err) console.log( err )
        res.send( html )
      })
    }, err => console.log(`Router [warn] : ${err}`))
  }

  {% for route of routes %}
  app.get('{{ route.path | safe }}', middleware('{{ route.path | safe }}', '{{ route.pagename }}') )
  {%- endfor %}

  app.use(config.serverMiddleware.path, require(
    path.resolve(rootPath, config.serverMiddleware.handler)
  ))

  return app
}

/*
*/
