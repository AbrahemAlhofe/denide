import Vue from 'vue';
import Vuex from 'vuex';
const store = require('../store/index')

Vue.use( Vuex )

export function createStore () {
  return new Vuex.Store( store )
}
