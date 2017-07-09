import Dispatcher from './PromiseDispatcher.js'
import Vue from 'vue'
import Store from './Store.js'

const SuperStoreError = {
  STORE_NULL: 'Store must exist',
  STORE_ALREADY_ADDED: (name) => `Store ${name} was already added`
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
    this.stores = []
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

    this._registerStoreToDispatcher(this)
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

  _registerStoreToDispatcher(store) {
    const wrappedStoreWithContext = (action) => store.reduce(action, store)
    store._dispachToken = this._dispatcher.register(wrappedStoreWithContext)
  }
  // add Store to the global SuperStore,
  // under the hood it override the state pointer of each store with the
  // global one
  addStore(store) {
    if (this[store.constructor.name])
      throw new Error(SuperStoreError.STORE_ALREADY_ADDED(store.constructor.name))

    if (!store || store === undefined)
      throw new Error(SuperStoreError.STORE_NULL)

    if (store instanceof Store)
      this._registerStoreToDispatcher(store)
      // plan function, a context will be passed as second input
    else if (typeof store == 'function') {
      const wrappedStoreWithContext = (action) => store(action, this)
      this._dispatcher.register(wrappedStoreWithContext)
    }

    this.stores.push(store)
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

  applyGlobalMiddlewere(middlewares) {

    this._applyMiddlewereToStores(this.stores, middlewares)
  }

  _applyMiddlewereToStores(stores, middlewares) {
    stores.forEach(store => this._applyMiddlewereToStore(store, middlewares))
  }

  _applyMiddlewereToStore(store, middlewares) {
    middlewares.forEach(middleware => {
      let dispatch = this.dispatch.bind(this)
      // state cannot be modified from the middleware
      const middlewareAPI = {
        getState: store.getState.bind(store),
        dispatch: (action) => dispatch(action)
      }

      store.dispatch = middleware(middlewareAPI)(dispatch)
    })
  }

  // copied from redux tutorial -> Redux middleware can be used
  applyMiddleware(stores, middlewares) {
    if (stores instanceof Array)
      this._applyMiddlewereToStores(stores, middlewares)
    else if (stores instanceof Store)
      this._applyMiddlewereToStore(stores, middlewares)
    // fail
  }
}

export default SuperStore
