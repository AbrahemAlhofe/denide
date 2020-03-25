const Vue = require('vue')
const ssr = require('vue-server-renderer').createRenderer()
const path = require('path')
const { routes } = require('../denide.config.js')

function createApp (context) {
  // since there could potentially be asynchronous route hooks or components,
 // we will be returning a Promise so that the server can wait until
 // everything is ready before rendering.
 return new Promise((resolve, reject) => {
   const page = require(`../dist/back/${ routes[context.url] }.js`)

   const { app, router } = require('../dist/back/app.js').default(page)

   // set server-side router's location
   router.push(context.url)

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

module.exports.renderPage = function (path, options, callback, error = () => {}) {
  createApp({ url : path }).then(({ app, assets }) => {
    ssr.renderToString( app, options, (err, html) => {
      if (err) console.log( err )
      callback( html , assets )
    })
  }).catch(err => console.log(err))
}
