const ssr = require('vue-server-renderer').createRenderer()
const path = require('path')
const { routes } = require( path.resolve(process.cwd(), './denide.config.js') )
const fs = require('fs')
const mustache = require('mustache')

module.exports.createDirectoryContents = function (templatePath, newProjectPath, data = {}) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      var contents = fs.readFileSync(origFilePath, 'utf8');

      if ( file in data ) {
        contents =  mustache.render(contents, data[file])
      }

      const writePath = `${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${newProjectPath}/${file}`);

      // recursive call
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
}

function createApp (context) {
  // since there could potentially be asynchronous route hooks or components,
 // we will be returning a Promise so that the server can wait until
 // everything is ready before rendering.
 return new Promise((resolve, reject) => {
   const page = require( path.resolve( process.cwd(), `./dist/back/${ routes[context.url] }.js` ) )

   const { app, router } = require( path.resolve( process.cwd(), './dist/back/app.js') ).default(page)

  router.beforeEach((v, next) => {
    console.log(v)
    next()
  })

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