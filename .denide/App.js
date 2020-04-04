import Vuex from 'vuex';
import Vue from 'vue';
import layout from '../layouts/default.vue';
import { createRouter } from './router';
import store from '../store/index';

Vue.use(Vuex);

global.Vue = Vue;

export default function createApp(page) {
  const router = createRouter(page);

  // register ssr plugins
  {{#plugins.ssr}}
  require('{{{ src }}}')
  {{/plugins.ssr}}

  const app = new Vue({
    render: (h) => h(layout),
    store: new Vuex.Store(store),
    router,
  });

  return { app, router };
}

(function client() {
  if (typeof window === 'undefined') return;
  const { app, router } = createApp();
 
  // register client plugins
  {{#plugins.client}} 
  require('{{{ src }}}')
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
