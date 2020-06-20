import Vue from 'vue';
import layout from '../layouts/default.vue';
import { createRouter } from './router';
import { createStore } from './store';
import mixin from './mixin.js'
import 'nprogress/nprogress.css'

Vue.mixin(mixin)

const router = createRouter();
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

let route = app.router.resolve( new URL( window.location ).pathname ).route

app.context = {
  store,
  router,
  route,
  middlewares,
  app
}

app.store.$router = app.router

app.store.app = app

function inject (key, value) {
  key = '$' + key
  Vue.use({ install (vm) { vm.prototype[key] = value } })
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

// register client plugins
{{#plugins.client}}
const plugin{{ index }} = require('{{{ src }}}')
if ( typeof plugin{{ index }}.default === 'function' ) {
  plugin{{ index }}.default(app.context, inject)
}
{{/plugins.client}}

function redirect (path) {
  const url = new URL( window.location )
  url.pathname = path
  window.location = url.href
}

router.beforeEach((to, from, next) => {
  middlewares.forEach( middleware => middleware({ ...app.context, redirect }) )
  next(vm => {
    console.log( vm.$i18n )
  })
})

const App = new Vue(app)

router.onReady(() => {
  App.$mount('body > div');
});
