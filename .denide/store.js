import Vue from 'vue';
import Vuex from 'vuex';
var store = require('../store/index')

store = Object.assign(store, { plugins : [] })

if ( typeof window === "object" ) store = { ...store, state : window.$__denide__cacheBag }

Vue.use( Vuex )

export function createStore () {
  return new Vuex.Store( store )
}
