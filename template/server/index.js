const express = require('express');
const app = express();
const config = require('../denide.config');
const Denide = require('denide');

const denide = new Denide(config)
denide.config.isProd = process.env.NODE_ENV === 'production'

async function start () {
  await denide.bundler()

  app.use( denide.render )

  app.listen(denide.config.port, () => {
    console.log('server is running in localhost:3000')
  })
}

start()
