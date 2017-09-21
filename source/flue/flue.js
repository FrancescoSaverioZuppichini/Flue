import SS from './SuperStore.js'
import Store from './Store.js'
import Action from './Action.js'
import Vue from 'vue'

// create the unique superstore
const SuperStore = new SS()

/**
 * Flue exposes all the classes as well as the 
 * correct intall function to be used direcly with Vue. 
 * 
 * Example:
 * Import { flueVue, SuperStore, Store, Action } from 'flue-vue'
 * 
 * Vue.use(flueVue) // The SuperStore will be available inside each vue component
 * in the $store field.
 */
const flueVue = {
  install(Vue, options) {
    Vue.prototype.$store = SuperStore
  }
};

export {
  SuperStore,
  Store,
  Action,
  flueVue
}
