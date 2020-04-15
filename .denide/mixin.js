import Vue from 'vue';
import VueMeta from 'vue-meta'
import { mergeAndConcat } from 'merge-anything';
const mixin = {}

mixin.serverPrefetch = async function () {
  if ( typeof this.$options.asyncData === 'function' ) { await this.$options.asyncData.call(this) }
}

mixin.mounted = async function () {
  if ( typeof this.$options.asyncData === 'function' ) { await this.$options.asyncData.call(this) }
}

mixin.created = async function () {
  // Head Management
  if ( typeof this.$options.head !== 'function' ) return
  const head = this.$options.head.call(this) || {}

  if ( typeof window !== 'object' ) {
    this.$ssrContext.head = mergeAndConcat(head, this.$ssrContext.head)
  } else {
    document.title = head.title
  }
}

// Register Plugin
Vue.use({ install (vue, options) { vue.mixin(mixin) } })
Vue.use(VueMeta, {
  // optional pluginOptions
  refreshOnceOnNavigation: true
})
