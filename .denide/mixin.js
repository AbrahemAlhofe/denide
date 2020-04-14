import Vue from 'vue';
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
  if ( typeof window !== 'object' ) {
    if ( typeof this.$options.head !== 'function' ) return
    const head = this.$options.head.call(this) || {}
    this.$ssrContext.head = mergeAndConcat(head, this.$ssrContext.head)
  }
}

// Register Plugin
Vue.use({ install (vue, options) { vue.mixin(mixin) } })
