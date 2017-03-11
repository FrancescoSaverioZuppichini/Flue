// import {
//   Dispatcher
// } from 'flux'
import Dispatcher from './PromiseDispatcher.js'
import Vue from 'vue'
import Store from './Store.js'

/**
 * This class is the top-level store, it keep a references to all the stores as fields
 * and it setup the dispacher for each new added store
 */
class SuperStore extends Store {
    constructor() {
        super()
        this.initialize()
    }

    initialize() {
        this.actions = {}
        this.dispatcher = new Dispatcher()
        this.state = {}
        this.vm = new Vue({
            data: {
                state: this
            }
        })
        this._dispachToken = this.dispatcher.register(this.actionsLogger.bind(this))
    }
    actionsLogger(action) {
        console.log(action)
    }

    addStores(arrayOfStores) {
        for (let store of arrayOfStores) {
            this.addStore(store)
        }
    }
    // add Store to the global SuperStore,
    // under the hood it override the state pointer of each store with the
    // global one
    addStore(store) {
        // keep a reference to the store to easy access
        this[store.constructor.name] = store
        // fetch all the store's state and put in the superStore
        for (let key in store.state) {
            Vue.set(this.state, key, store.state[key])
        }
        //override state pointer of the store with the global one -> make the store stateless
        store.state = this.state // -> is it dangerous?
        // register the store's reducer in the global dispacher
        store._dispachToken = this.dispatcher.register(store.reduce.bind(store))
        // take all the actions from the store and pass to them the dispacher and the store as a context
        Object.assign(this.actions, store.actions(this.dispatcher, store))
        // make a ref to the superStore
        store.sStore = this
    }
}


export default SuperStore
