import Router from 'vue-router'
import Vue from 'vue'
import json2html from './json2html.js'

Vue.use(Router)

const view = (to, pagename, page) => resolve => {
  // if we are on server side pass page what pass from server to router
  if ( typeof window !== 'object' ) { return resolve(page) }

  // get page from pages
  const pageChached = window.$__denide__pages[ pagename ]

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
    console.log( assets )
    json2html(assets, document, { push })
  }

  fetch(`/page/${ pagename }`).then(res => res.json()).then(initPage)
}

export function createRouter (page) {
  return new Router({
    mode: 'history',
    routes: [
      {{#routes}}
      { path : '{{{ path }}}', name : '{{ pagename }}', component : view('{{{ path }}}', '{{ pagename }}', page) },
      {{/routes}}
    ]
  })
}
