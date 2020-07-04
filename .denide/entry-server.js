import Vue from 'vue';
import ClientOnly from 'vue-client-only'
import layout from '../layouts/default.vue';
import { createRouter } from './router';
import { createStore } from './store';
import mixin from'./mixin.js'

Vue.mixin(mixin)

export default function createApp(page, req = {}, res = {}, redirect) {
  const context = {}
  const router = createRouter(page, context);
  const store = createStore();
  const middlewares = []

  {{#middlewares}}
  middlewares.push( require('{{{ path }}}').default )
  {{/middlewares}}

  Vue.component('client-only', ClientOnly)

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

  Object.assign(context, {
    store,
    router,
    route,
    middlewares,
    app,
    redirect,
    req,
    res
  })

  app.context = context

  app.store.$router = app.router

  app.store.app = app

  function inject (key, value) {
    key = '$' + key
    app[key] = value
    Vue.use({ install(vm) { vm.prototype[key] = value } })
    app.context[key] = value
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

  router.beforeEach((to, from, next) => {
    middlewares.forEach( middleware => middleware({ ...app.context, redirect }) )
    next()
  })

  return { app : new Vue(app), router }
}
