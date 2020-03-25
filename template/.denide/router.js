import { routes } from '../denide.config.js'
import Router from 'vue-router'
import Vue from 'vue'
import json2html from './json2html.js'

Vue.use(Router)

const view = (to, page) => resolve => {

  // if we are on server side pass page what pass from server to router
  if ( typeof window !== 'object' ) { resolve(page); return }

  // get page from pages
  const pageChached = window.$__denide__pages[ routes[to] ]

  // if page loaded before pass it to router
  if ( pageChached ) { resolve(pageChached); return }

  function push(document, elm) {

    if ( elm.localName === 'link' || elm.localName === 'script' ) {
      const firstScript = document.getElementsByTagName(elm.localName)[0]
      firstScript.parentNode.insertBefore(elm, firstScript.nextSibling)
      return
    }

    document.appendChild(elm)
  }

  // on page load send it to router
  window.$__denide__onPageLoad = (page) => resolve(page)

  function initPage ({ assets }) {
    const addDataAttribute = (elm) => {
      elm['data-page'] = routes[to]
      return elm
    }
    json2html(assets, document, { push,
      link : addDataAttribute,
      script : addDataAttribute
    })
  }

  fetch(`/page/${ routes[to] }`).then(res => res.json()).then(initPage)
}

export function createRouter (page) {
  const Routes = []

  for ( let path in routes ) {
    const route = routes[path]
    Routes.push({ path, name : route, component : view(path, page) })
  }

  return new Router({
    mode: 'history',
    routes: Routes
  })
}
