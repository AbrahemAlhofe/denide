import Vue from 'vue';

const asyncData = {
  install (vue, options) {
    vue.mixin({
      async serverPrefetch () {
        if ( typeof this.asyncData === 'function' ) { await this.asyncData() }
      },
      async mounted () {
        if ( typeof this.asyncData === 'function' ) { await this.asyncData() }
      }
    })
  }
}

Vue.use(asyncData)
