const path = require('path');
const cookieParser = require('cookie-parser')
const express = require('express');
const mustache = require('mustache');
const app = express.Router();

const fs = require('fs')
const json2html = require('./json2html')
const { JSDOM } = require('jsdom')
const { mergeAndConcat } = require('merge-anything')
const Renderer = require('vue-server-renderer').createRenderer
const compression = require('compression')

const createApp = require('../dist/back/entry-server.js').default

const rootPath = path.resolve(process.cwd())

app.use( cookieParser() )

app.use(compression())

module.exports = function (config) {
  var { routes, head, body } = config

  app.use(config.serverMiddleware.path, require(
    path.resolve(rootPath, config.serverMiddleware.handler)
  ))

  app.use( express.static( path.join(rootPath, '/dist') ) )
  app.use('/assets', express.static( path.join(rootPath, '/assets') ) )

  app.get('/page/:page', (req, res) => {
    const page = require(`../dist/back/${req.params.page}`)

    const assets = mergeAndConcat({
      head : {
        link : [{ rel : 'stylesheet', href : `/${ req.params.page }.css` }]
      },
      body : {
        script : [{ src : `/front/${ req.params.page }.js`, async : true }]
      }
    }, page.html || {})

    res.send({ assets })
  })

  const middleware = pagename => (req, res, next) => {
    const ssr = Renderer({
      template (result, context) {
        const { document } = new JSDOM(result).window
        const { head, body } = context
        return `<html> ${ json2html({ head, body }, document).documentElement.innerHTML } </html>`
      }
    })

    const page = require(`../dist/back/${ pagename }.js`)

    if ( page.html ) {
      head = mergeAndConcat(head, page.html.head || {})
      body = mergeAndConcat(body, page.html.body || {})
    }

    const context = {
      head : mergeAndConcat(head, {
        link : [
          { rel : 'stylesheet', href : `/${ pagename }.css` },
          { rel : 'stylesheet', href : `/entry-client.css`}
        ]
      }),
      body : mergeAndConcat(body, {
        script : [
          { src : `/front/common.js` },
          { src : `/front/${ pagename }.js` },
          { src : '/entry-client.js' }
        ]
      })
    }

    var redirectPath = ''

    const { app, router } = createApp(
      page,
      req,
      res, 
      path => redirectPath = path
    )

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
        if ( redirectPath ) return res.redirect( redirectPath )

        const file = fs.readFileSync( path.join(rootPath, '/dist/front/entry-client.js') )
        const content = mustache.render(file.toString(), { value : JSON.stringify(app.$store.state).replace(/"/g, '\\"') })
        fs.writeFileSync( path.join( rootPath, '/dist/entry-client.js' ), content )

        res.send(html)
      })
    }, err => console.log(`Router [warn] : ${err}`))
  }

  {{#routes}}
  app.get('{{{ path }}}', middleware('{{ pagename }}') )
  {{/routes}}

  return app
}
