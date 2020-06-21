import Router from 'vue-router'
import Vue from 'vue'
import json2html from './json2html.js'
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

Vue.use(Router)

const view = (to, pagename, page, context) => resolve => {

  function sendPage (page) {

    if ( page.asyncData ) {
      page.asyncData.call(context).then(data => {
        page.mixins = [ { data () { return data } } ]
        resolve(page)
      })
    } else resolve(page)

  }

  // if we are on server side pass page what pass from server to router
  if ( typeof window !== 'object' ) return sendPage(page)

  // get page from pages
  const pageCached = window.$__denide__pages[ pagename ]

  // if page loaded before pass it to router
  if ( pageCached ) return sendPage(pageCached); 

  // on page load send it to router
  window.$__denide__onPageLoad = (page) => sendPage(page)

  function initPage ({ assets }) {
    NProgress.done();
    json2html(assets, document, {
      push ( document, elm ) {
        if ( elm.localName === 'link' || elm.localName === 'script' ) {
          const firstScript = document.getElementsByTagName(elm.localName)[0]
          firstScript.parentNode.insertBefore(elm, firstScript.nextSibling)
          return
        }

        document.appendChild(elm)
      }
    })
  }

  NProgress.start();
  fetch(`/page/${ pagename }`).then(res => res.json()).then(initPage)
}

export function createRouter (page, context) {
  return new Router({
    mode: 'history',
    routes: [
      {{#routes}}
        {
          path : '{{{ path }}}',
          name : '{{ pagename }}',
          component : view('{{{ path }}}', '{{ pagename }}', page, context)
        },
      {{/routes}}
    ]
  })
}
