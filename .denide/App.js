import Vue from 'vue';
import layout from '../layouts/default.vue';
import { createRouter } from './router';
import { createStore } from './store';
import './mixin.js'

export function createApp(page, req = {}, res = {}) {
  const router = createRouter(page);
  const store = createStore();
  const middlewares = []

  {{#middlewares}}
  middlewares.push( require('{{{ path }}}') )
  {{/middlewares}}

  const app = {
    store,
    router,
    created () {
      this.context = this.$options.context
    },
    render: (h) => h(layout)
  }

  app.context = {
    store,
    router,
    middlewares,
    app,
    req,
    res
  }

  app.store.$router = app.router

  function inject (key, value) {
    app[key] = value
    app.store[key] = value
  }

  // register ssr plugins
  {{#plugins.ssr}}
    const plugin{{ index }} = require('{{{ src }}}')
    if ( typeof plugin{{ index }}.default === 'function' ) {
      plugin{{ index }}.default(app.context, inject)
    }
  {{/plugins.ssr}}

  router.beforeEach((to, from, next) => {
    middlewares.forEach( middleware => middleware(app.context) )
    next()
  })

  return { app : new Vue(app), router };
}
