import Vue from 'vue'
import Store from './Store.js'

const SuperStoreError = {
  STORE_NULL: 'Store must exist',
  INVALID_STORE: 'Store must extends Store',
  STORE_ALREADY_ADDED: (name) => `Store ${name} was already added`
}
/**
 * "*One Store to rule them all*"
 * 
 * This class is the top-level store. It manages all the state and stores in order to dispatch actions.
 * It can be seen as a container for all the stores. Flue is just a SuperStore instance.
 */
class SuperStore extends Store {
  constructor() {
    super()
    this.middlewares = []
    this.actions = {}
    this.providers = {}
    this.stores = []
    this.refs = {}
    this.initialize()
  }

  _copyActionsRefs(actions) {
    for (let key in actions) {
      this.actions[key] = actions[key]
    }
  }

  /**
   * This function takes an object of actions and to add them
   * to the global store making them available from anywhere.
   * Example:
   * 
   * ```javascript
   * import { flue } from 'flue-vue'
   * const actions = {
   *  test() {
   *    flue.dispatch(new Action("TEST_ACTION"))
   *   }
   * }
   * 
   * flue.addActions(actions)
   * flue.actions.test()
   * 
   * ```
   * @param {Function} actionProvider
   */
  addActions(actions) {
    this._copyActionsRefs(actions)
  }
  /**
   * Copy all the store's action, if any. 
   * This is done automatically when a new store is added 
   * using flye.addStore(Store)
   * @param {Store} store 
   */
  addActionsFromStore(store) {
    if (typeof store.actions == 'function'){
      const actions = store.actions(store)
      this._copyActionsRefs(actions)
    }
  }

  _registerStoreToDispatcher(store) {
    store._dispachToken = this._dispatcher.register(store.reduce.bind(store))
  }

  // use Vue vm to make it reactive
  _addState(state){
    for (let key in state) {
      Vue.set(this.state, key, state[key])
    }
  }

  /**
   * Add multiple stores at the same tme
   * @param {Array<Store>} arrayOfStores 
   */
  addStores(arrayOfStores) {
    arrayOfStores.forEach(store => this.addStore(store))
  }

  /**
  * This function add Store to the global flue instance,
  * under the hood it override the state pointer of each store with the
  * global one
  * @param {Store} store A Store instance
  */
  addStore(store) {
    if (!store || store === undefined)
      throw new Error(SuperStoreError.STORE_NULL)

    if (!(store instanceof Store))
      throw new Error(SuperStoreError.INVALID_STORE)

    this._registerStoreToDispatcher(store)
    // assign global dispatcher
    store._dispatcher = this._dispatcher
    // fetch all the store's state and put in the superStore
    this._addState(store.state)
    // override state pointer of the store with the global one -> make the store stateless
    store.state = this.state
    // take all the actions from the store and pass to them the dispatcher and the store itself as a context
    this.addActionsFromStore(store)
    // make a ref to the superStore
    store.flue = this  
    store.sStore = this    
    store.$store = this    
    // also directly store providers to fast access
    store.providers = this.providers
    // save the store
    this.stores.push(store)
    this.refs[store.name] = store
  }

  /**
   * Add a raw reducer function, a unnamed store
   * will be created and its reduce function overrided
   * Example:
   * 
   * var reducer = (action) => { console.log(action.type) }
   * flue.addReducer(reducer)
   * 
   * @param {Function} reducer 
   */
  addReducer(reducer) {
    // spawn a new store
    const unknowStore = new Store()
   // override its reduce function
    unknowStore.reduce = reducer
    
    this.addStore(unknowStore)
  }

  /**
   * This function applies the given middlewares
   * to a single store
   * [Redux middlewares](http://redux.js.org/docs/advanced/Middleware.html) can be used
   * @param {Store} stores A Store instance
   * @param {Array} middlewares 
   */
  applyMiddlewareToStore(store, middlewares) {
    middlewares.forEach(middleware => {
      let dispatch = this.dispatch.bind(this)
      // state cannot be modified from the middleware
      const middlewareAPI = {
        getState: this.getState.bind(this),
        dispatch: (action) => dispatch(action)
      }
      
      store.dispatch = middleware(middlewareAPI)(dispatch)
    })
  }

  /**
   * This function applies the given middlewares
   * to multiple stores
   * [Redux middlewares](http://redux.js.org/docs/advanced/Middleware.html) can be used
   * @param {Array} stores An Array of Stores
   * @param {Array} middlewares 
   */
  applyMiddlewareToStores(stores, middlewares) {
    stores.forEach(store => this.applyMiddlewareToStore(store, middlewares))
  }

  /**
   * This function applies the given middlewares 
   * to each store.
   * [Redux middlewares](http://redux.js.org/docs/advanced/Middleware.html) can be used
   * @param {Array} middlewares 
   */
  applyGlobalMiddleware(middlewares) {
    // middlewares = middlewares.slice()
    // middlewares.reverse()
    this.applyMiddlewareToStores(this.stores, middlewares)
  }

  /**
   * It may be convinient to add some external package
   * directly into flue in order to make it
   * available from all the stores and components.
   * Example:
   * 
   * ```javascript
   * import axios from 'axios'
   * 
   * flue.addProvider({ key: 'client', source: axios })
   * 
   * flue.providers.client.get(...)
   * ```
   * 
   * @param {Object} provider A provider.
   */
  addProvider(provider){
    this.providers[provider.key] = provider.source
  }
  
}

const flue = new SuperStore()

export default flue
