const mustache = require('mustache')
const fs = require('fs')
const path = require('path')
const webpack = require('webpack');

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
      if ( !fs.existsSync(`${newProjectPath}/${file}`) ) {
        fs.mkdirSync(`${newProjectPath}/${file}`);
      }

      // recursive call
      this.createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
}

module.exports.createDenideFolder = (options) => {
    if ( !fs.existsSync(path.resolve(process.cwd(), './.denide')) ) {
      fs.mkdirSync( path.resolve( process.cwd(), './.denide' ) )
    }

    this.createDirectoryContents( path.resolve(__dirname, './.denide'), path.resolve(process.cwd(), './.denide'), options)
}

module.exports.classifyPlugins = (plugins) => {
    plugins = plugins.map((plugin, index) => {
        if ( typeof plugin === 'string' ) {
          plugin = { src : plugin, mode : 'ssr', index }
        }

        if ( typeof plugin === 'object' ) {
          plugin = Object.assign({ src : plugin.src, mode : 'ssr', index }, plugin)
        }
        return plugin
    })

    return {
        client : plugins.filter( plugin => plugin.mode === 'client' ),
        ssr : plugins.filter( plugin => plugin.mode === 'ssr' ),
        server : plugins.filter( plugin => plugin.mode === 'server' )
    }
}

module.exports.reloadServer = () => {
    // re write server file to make nodmon reload server
    const serverPath = path.resolve(process.cwd(), './server/index.js')
    const content = fs.readFileSync( serverPath )
    fs.writeFileSync( serverPath, content, 'utf-8')
}

module.exports.getCompilers = ( configs, isFirstTime ) => {
    const compilers = []

    configs.forEach(config => {
        const compiler = webpack( config )
        const step = (resolve) => {
            // build and watch entries files
            compiler.watch({}, (error, stats) => {
              // if is there error stop process
              if ( error || stats.hasErrors() ) {
                process.stdout.write(stats.toString() + '\n');
              }

              // if it is not first time file run
              if ( !isFirstTime ) this.reloadServer()

              resolve(stats)
            });
        }

        compilers.push( new Promise(step) )
    })

    return compilers
}

module.exports.generateRoutes = (routes) => {
  const result = []
  for (let path in routes ) {
    const pagename = routes[path]
    result.push({ path, pagename })
  }
  return result
}
