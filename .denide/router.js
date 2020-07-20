import Router from 'vue-router'
import Vue from 'vue'
import json2html from './json2html.js'
import NProgress from 'nprogress';

NProgress.configure({ showSpinner: false });

Vue.use(Router)

const view = (to, pagename, page, context) => resolve => {
  function sendPage (page) {

    if ( !page.asyncData ) return resolve(page)

    function resolver (data) {
      const mixin = {
        data() { return data },
        mounted() {
          page.asyncData(context, data => { for (let key in data) this[key] = data[key] })
        }
      }
      
      page.mixins = [mixin]

      resolve(page)

    }

    page.asyncData(context, resolver)
  }

  // if we are on server side pass page what pass from server to router
  if ( typeof window !== 'object' ) return sendPage(page.default)

  // on page load send it to router
  window.$__denide__onPageLoaded = (page) => sendPage(page)

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
