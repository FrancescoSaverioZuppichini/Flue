import Dispatcher from './PromiseDispatcher.js'
import Vue from 'vue'
import Store from './Store.js'

const SuperStoreError = {
  STORE_NULL: 'Store must exist'
}
/**
 * This class is the top-level store, it keep a references to all the stores as fields
 * and it setup the dispacher for each new added store
 */
class SuperStore extends Store {
  constructor() {
    super()
    this.initialize()
    this.middlewares = []
  }

  initialize() {
    this.actions = {}
    this._dispatcher = new Dispatcher()
    this.state = {}
    // start a Vue vm to make the global state reactive
    this.vm = new Vue({
      data: {
        state: this
      }
    })
    this.addStore(this)
  }

  addStores(arrayOfStores) {
    arrayOfStores.forEach(store => this.addStore(store))
  }

  addActions(actionsProvider, store) {
    // pass env
    const actions = actionsProvider(store)
    // copy ref to this store
    for (let key in actions) {
      this.actions[key] = actions[key]
    }
  }

  // add Store to the global SuperStore,
  // under the hood it override the state pointer of each store with the
  // global one
  addStore(store) {
    if (!store || store === undefined)
      throw new Error(SuperStoreError.STORE_NULL)

    if (store instanceof Store)
      store._dispachToken = this._dispatcher.register(store.reduce.bind(store))

    else if (typeof store == 'function')
      this._dispatcher.register(store.bind(this))

      // keep a reference to the store to easy access
    this[store.constructor.name] = store
    // assign global dispatcher
    store._dispatcher = this._dispatcher
    // fetch all the store's state and put in the superStore
    for (let key in store.state) {
      Vue.set(this.state, key, store.state[key])
    }
    //override state pointer of the store with the global one -> make the store stateless
    store.state = this.state // -> is it dangerous?
    // register the store's reducer in the global dispacher
    // check if store exposes actions
    if (typeof store.actions == 'function')
      // take all the actions from the store and pass to them the dispatcher and the store itself as a context
      this.addActions(store.actions, store)
      // make a ref to the superStore
    store.sStore = this
  }

  // copied from redux tutorial
  applyMiddleware(store, middlewares) {
    middlewares = middlewares.slice()
    middlewares.reverse()

    middlewares.forEach(middleware => {
      let dispatch = store.dispatch.bind(this)

      // state cannot be modified from the middleware
      const middlewareAPI = {
        getState: store.getState.bind(store),
        dispatch: (action) => dispatch(action)
      }
      store.dispatch = middleware(middlewareAPI)(dispatch)
    })
  }
}

export default SuperStore
