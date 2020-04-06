const ssr = require('vue-server-renderer').createRenderer()
const path = require('path')
const { routes } = require( path.resolve(process.cwd(), './denide.config.js') )

function createApp (context) {
  // since there could potentially be asynchronous route hooks or components,
 // we will be returning a Promise so that the server can wait until
 // everything is ready before rendering.
 return new Promise((resolve, reject) => {
   const page = require( path.resolve( process.cwd(), `./dist/back/${ routes[context.path] }.js` ) )

   const { app, router } = require( path.resolve( process.cwd(), './dist/back/app.js') ).default(page)

  router.beforeEach((to, from, next) => {
    require( path.resolve( process.cwd(), './middleware/auth.js' ) )({
      req : context.req,
      route : router,
      store : app.$store
    })

    next()
  })

   // set server-side router's location
   router.push(context.path)

   // wait until router has resolved possible async components and hooks
   router.onReady(() => {
     const matchedComponents = router.getMatchedComponents()
     // no matched routes, reject with 404
     if (!matchedComponents.length) {
       return reject({ code: 500 })
     }

     // the Promise should resolve to the app instance so it can be rendered
     resolve({app, assets : page.html })
   }, reject)

 })
}

module.exports.renderPage = function (context, options, callback, error = () => {}) {
  createApp(context).then(({ app, assets }) => {
    ssr.renderToString( app, options, (err, html) => {
      if (err) console.log( err )
      callback( html , assets )
    })
  }).catch(err => console.log(err))
}