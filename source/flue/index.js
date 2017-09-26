import flue from './SuperStore.js'
import Store from './Store.js'
import Action from './Action.js'
import Vue from 'vue'

// create the unique superstore

/**
 * Flue exposes all the classes as well as the 
 * correct intall function to be used direcly with Vue. 
 * 
 * Example:
 * Import { flueVue, superStore, Store, Action } from 'flue-vue'
 * 
 * Vue.use(flueVue) // The superStore will be available inside each vue component
 * in the $store field.
 */

flue.install = function(Vue, options) {
  Vue.prototype.$store = flue
}
// old version
const SuperStore = flue

export {
  flue,
  SuperStore,
  Store,
  Action,
}
