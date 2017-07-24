import Action from './Action.js'
import Dispatcher from './PromiseDispatcher.js'
import Vue from 'vue'

const StoreError = {
  DISPATCHER_NOT_INITIALIZED: 'Dispacher must be initialize fist\nBe sure to call .addStore before call dispatch',
  INVALID_ACTION: 'Action must be instance of Action or object-like type',
  INVALID_SUBSCRIBER: 'Subcribers must be functions'
}

/**
 * Store classes is the basic state container
 * it provides a reference to the global dispatcher
 * and a way to dispatch and resolve actions
 * @type {Object}
 */
class Store {
  constructor() {
    this.state = {}
    this._dispatcher
    this.listeners = []
  }
  /**
   * Runtime initialization of the dispatcher
   * and the vm. At any point a store can become self-sufficient
   * by calling this function. The global dispatcher will be override
   * with the stores' local one and a Vue vm will be spawned to handle
   * the state reactivity
   *
   * @return {[type]} [description]
   */
  initialize() {
    this.initializeDispatcher()
    this.createVueVM()
    this._dispatcher.register(this.reduce)
  }

  createVueVM() {
    // start a Vue vm to make the state reactive
    this.vm = new Vue({
      data: {
        state: this
      }
    })
  }
  initializeDispatcher() {
    this._dispatcher = new Dispatcher()
  }

  // return a copy of the current state
  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  subscribe(func) {
    if (typeof func != 'function')
      throw new Error(StoreError.INVALID_SUBSCRIBER)

    this.listeners.push(func)

    return () => this.listeners.splice(this.listeners.indexOf(func), 1)
  }

  notify() {
    this.listeners.forEach(listener => listener(this))
  }
  /**
   * This function is used to dispatch actions,
   * it is a wrapper around _dispatcher.dispatch
   * in order to provide more options to the client
   * @param  {[type]} args [An Action instance,
   *  or an Action-like vanilla object]
   * @return {[type]}      [description]
   */
  dispatch(action) {
    if (!this._dispatcher)
      throw new Error(StoreError.DISPATCHER_NOT_INITIALIZED)
      // nothing to dispatch
    if (!action)
      return
      // check if is an Action instance
    if (action instanceof Action) {
      return this._dispatcher.dispatch(action).then(() => this.notify())
    }
    // check if is a vanilla js object
    if (typeof action == 'object')
      if (action.type) {
        return this._dispatcher.dispatch(this.createAction(action.type, action.payload)).then(() => this.notify())

      }

    throw new Error(StoreError.INVALID_ACTION)
  }

  // Explicit dispatch an Action instance
  dispatchAction(type, payload) {
    if (!this._dispatcher)
      throw new Error(StoreError.DISPATCHER_NOT_INITIALIZED)
    this.dispatch(this.createAction(type, payload))
  }

  // Util function, can be called without import Action
  createAction(type, payload) {
    return new Action(type, payload)
  }
  /**
   * Map each action to the correct function
   * @param  {[type]} action            [The Action]
   * @param  {[type]} actionFunctionMap [A dictionary with action type as key and function as value]
   * @return {[type]}                   [description]
   */
  reduceMap(action, actionFunctionMap, payloadKey = 'payload') {
    const func = actionFunctionMap[action.type]
    if (func && func.this !== this)
      func.bind(this)(action[payloadKey])
  }

  // Store always provide a reduce, even if it does not anything
  reduce(action) {}

  actions() {}

}

export default Store
