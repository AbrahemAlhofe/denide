import Vue from 'vue';
import Vuex from 'vuex';
var store = require('../store/index')

store = Object.assign(store, { plugins : [] })

if ( typeof window === "object" ) store = { ...store, state : JSON.parse('{{{ value }}}') }

Vue.use( Vuex )

export function createStore (setCacheBag) {

  store.plugins.push(function (store) {
    store.subscribe(function (mutation, state) {
      if ( typeof window !== 'object' ) {
        setCacheBag( state )
      }
    })
  })

  return new Vuex.Store( store )
}
