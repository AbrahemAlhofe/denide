import Vue from 'vue';
import layout from '../layouts/default.vue';
import { createRouter } from './router';
import store from '../store/index';

export default function createApp(page) {
  const router = createRouter(page);

  const options = { render: (h) => h(layout), store, router }

  // register ssr plugins
  {{#plugins.ssr}}
  const plugin{{ index }} = require('{{{ src }}}')
  if ( typeof plugin{{ index }}.default === 'function' ) { 
    plugin{{ index }}.default(options)
  }
  {{/plugins.ssr}}

  const app = new Vue(options)

  app.$i18n.locale = 'en'

  return { app, router };
}

(function client() {
  if (typeof window === 'undefined') return;
  const { app, router } = createApp();
 
  // register client plugins
  {{#plugins.client}} 
  const plugin{{ index }} = require('{{{ src }}}')
  if ( typeof plugin{{ index }}.default === 'function' ) { 
    plugin{{ index }}.default(options)
  }
  {{/plugins.client}}


  router.beforeEach((to, from, next) => {
    const getPage = to.matched[0].components.default;

    if (typeof getPage !== 'function') {
      const { title } = getPage.html.head;
      document.title = title;
    }

    next();
  });

  router.onReady(() => {
    app.$mount('body > div');
  });
}());
