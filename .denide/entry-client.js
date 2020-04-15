import { createApp } from './App.js'
import 'nprogress/nprogress.css'

const { app, router } = createApp();

// register client plugins
{{#plugins.client}}
  const plugin{{ index }} = require('{{{ src }}}')
  if ( typeof plugin{{ index }}.default === 'function' ) {
    plugin{{ index }}.default(app.context, inject)
  }
{{/plugins.client}}

router.onReady(() => {
  app.$mount('body > div');
});
