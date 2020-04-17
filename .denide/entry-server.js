import { createApp } from './App.js'
export default function (...args) {
  const { app, router, inject } = createApp(...args)

  {{#plugins.server}}
    const plugin{{ index }} = require('{{{ src }}}')
    if ( typeof plugin{{ index }}.default === 'function' ) {
      plugin{{ index }}.default(app.context, inject)
    }
  {{/plugins.server}}

  return { app, router }
}
