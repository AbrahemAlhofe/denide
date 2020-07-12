const express = require('express');
const app = express();
const config = require('../denide.config');
const Denide = require('denide');

const denide = new Denide(config)
denide.config.isProd = process.env.NODE_ENV === 'production'

async function start () {
  if ( !denide.config.isProd ) await denide.bundle()

  app.use( denide.render( config ) )

  app.listen(denide.config.port, () => {
    console.log('server is running in localhost:3000')
  })
}

start()
