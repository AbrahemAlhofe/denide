const path = require('path');
const { renderPage } = require('./utils');
const json2html = require('./json2html');
const { JSDOM } = require('jsdom')
const { mergeAndConcat } = require('merge-anything')
const cookieParser = require('cookie-parser')
const express = require('express');
const app = express.Router();

const rootPath = path.resolve(process.cwd())

app.use( cookieParser() )

module.exports = function (config) {
  app.use('/src', express.static( path.join(rootPath, '/dist') ))

  app.get('/page/:page', (req, res) => {
    const routes = require('./entries')('back')
    const page = require( path.resolve(rootPath, routes[req.params.page]) )

    const data = {
      head : {
        link : [{ rel : 'stylesheet', href : `/src/${page.name}.css` }]
      },
      body : {
        script : [{ src : `/src/front/${page.name}.js` }]
      }
    }

    res.send({ assets : mergeAndConcat(data, page.html || {}) })

  })

  const { routes, link, script } = config

  for ( let path in routes ) {

    app.get(path, (req, res) => {
      renderPage({ path, req }, {}, (template, assets) => {
        const pagename = routes[path]
        const { document } = new JSDOM(template).window

        // add default assets
        template = json2html(mergeAndConcat(assets, {
          head : {
            link : [
              { rel : 'stylesheet', href : `/src/${pagename}.css` }
            ]
          },
          body : {
            script : [
              { src : `/src/front/${pagename}.js` }
            ]
          }
        }), document, {
            link : (link) => {
              link['data-page'] = pagename
              return link
            },
            script : (script) => {
              script['data-page'] = pagename
              return script
            }
        })

        template = json2html(mergeAndConcat(assets, {
          head : {
            link : [
              ...link,
              { rel : 'stylesheet', href : '/src/app.css' }
            ]
          },
          body : {
            script : [
              ...script,
              { src : '/src/front/app.js' }
            ]
          }
        }), document)

        res.send(template.documentElement.innerHTML)
      })
    })

  }

  for ( let middleware of config.serverMiddleware ) {
    app.use(middleware.path, require(
      path.resolve(rootPath, middleware.handler)
    ))
  }

  return app
}
