import Vue from 'vue';
import layout from '../layouts/default.vue';
import { createRouter } from './router';
import { createStore } from './store';
import './mixin.js'

export default function createApp(page, req = {}, res = {}, setCacheBag, redirectServer) {
  const router = createRouter(page);
  const store = createStore(setCacheBag);
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

  let route = {}

  if ( typeof window !== 'object' ) {
    route = app.router.resolve(req.path).route
  } else {
    route = app.router.resolve( new URL( window.location ).pathname ).route
  }

  app.context = {
    store,
    router,
    route,
    middlewares,
    app,
    req,
    res
  }

  app.store.$router = app.router

  app.store.app = app

  function inject (key, value) {
    key = '$' + key
    app[key] = value
    Vue.use({ install(vm) { vm.prototype[key] = value } })
    app.store[key] = value
  }

  // register ssr plugins
  {{#plugins.ssr}}
    const plugin{{ index }} = require('{{{ src }}}')
    if ( typeof plugin{{ index }}.default === 'function' ) {
      plugin{{ index }}.default(app.context, inject)
    }
  {{/plugins.ssr}}

  // register server side plugins
  {{#plugins.server}}
    const plugin{{ index }} = require('{{{ src }}}')
    if ( typeof plugin{{ index }}.default === 'function' ) {
      plugin{{ index }}.default(app.context, inject)
    }
  {{/plugins.server}}

  // if there is plugin edite store state
  setCacheBag(store.state)

  function redirect (path) {
    if ( typeof window == 'object' ) {
      const url = new URL( window.location )
      url.pathname = path
      window.location = url.href
    } else {
      redirectServer(path)
    }
  }

  router.beforeEach((to, from, next) => {
    middlewares.forEach( middleware => middleware({ ...app.context, redirect }) )
    next()
  })

  return { app : new Vue(app), router };
}
