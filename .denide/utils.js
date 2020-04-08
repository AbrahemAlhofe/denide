const path = require('path')
const { routes } = require( path.resolve(process.cwd(), './denide.config.js') )
const json2html = require('./json2html')
const { JSDOM } = require('jsdom')
const { mergeAndConcat } = require('merge-anything')
const ssr = require('vue-server-renderer').createRenderer({
  template (result, context) {
    const { document } = new JSDOM(result).window
    return `<html> ${ json2html(context.html, document).documentElement.innerHTML } </html>`
  }
})

function createApp (req) {
  // since there could potentially be asynchronous route hooks or components,
 // we will be returning a Promise so that the server can wait until
 // everything is ready before rendering.
 return new Promise((resolve, reject) => {
   const page = require( path.resolve( process.cwd(), `./dist/back/${ routes[req.url] || routes['*'] }.js` ) )

   const { app, router } = require( path.resolve( process.cwd(), './dist/back/app.js') ).default(page)

  router.beforeEach((to, from, next) => {
    {{#middlewares}}
    require( path.resolve( process.cwd(), '{{{ path }}}' ) )({ req,
      route : router,
      store : app.$store
    })
    {{/middlewares}}

    next()
  })

   // set server-side router's location
   router.push(req.url)

   // wait until router has resolved possible async components and hooks
   router.onReady(() => {
     const matchedComponents = router.getMatchedComponents()
     // no matched routes, reject with 404
     if (!matchedComponents.length) {
       req.url = 'error'
       return createApp(req).then( r => resolve(r) )
     }

     // the Promise should resolve to the app instance so it can be rendered
     resolve({app, assets : page.html })
   }, reject)

 })
}

module.exports.renderPage = function (context, options, callback, error = () => {}) {
  createApp(context).then(({ app, assets }) => {
    ssr.renderToString( app, mergeAndConcat({ html : assets }, options), (err, html) => {
      if (err) console.log( err )
      callback( html , assets )
    })
  }).catch(err => console.log(err))
}
