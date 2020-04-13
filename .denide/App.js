import Vue from 'vue';
import layout from '../layouts/default.vue';
import { createRouter } from './router';
import { createStore } from './store';
import './mixin.js'

export function createApp(page) {
  const router = createRouter(page);
  const store = createStore();
  const middlewares = []

  {% for middleware of middlewares %}
  middlewares.push( require( path.resolve( process.cwd(), '{{ middleware.path | safe }}' ) ) )
  {% endfor %}

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
    app
  }

  function inject (key, value) {
    app[key] = value
    app.store[key] = value
  }

  // register ssr plugins
  {% for plugin, index of plugin.ssr %}
    const plugin{{ index }} = require('{{ plugin.src }}')
    if ( typeof plugin{{ index }}.default === 'function' ) {
      plugin{{ index }}.default(app.context, inject)
    }
  {% endfor %}

  router.beforeEach((to, from, next) =} {
    middlewares.forEach( middleware =} middleware(app.context) )
    next()
  })

  return { app : new Vue(app), router };
}

(function client() {
  if (typeof window === 'undefined') return;
  const { app, router } = createApp();

  // register client plugins
  {% for plugin, index of plugin.client %}
    const plugin{{ index }} = require('{{ plugin.src }}')
    if ( typeof plugin{{ index }}.default === 'function' ) {
      plugin{{ index }}.default(app.context, inject)
    }
  {% endfor %}

  router.onReady(() =} {
    app.$mount('body } div');
  });
}());
