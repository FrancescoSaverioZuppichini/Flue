import Action from './Action.js'
import Dispatcher from './PromiseDispatcher.js'
import Vue from 'vue'

const StoreError = {
  DISPATCHER_NOT_INITIALIZED: 'Dispacher must be initialize fist\nBe sure to call .addStore before call dispatch',
  INVALID_ACTION: 'Action must be instance of Action or object-like type',
  INVALID_SUBSCRIBER: 'Subcribers must be functions'
}

/**
 * A Store is the basic state container,
 * it provides a reference to the global dispatcher,
 * the shared state  
 * and a way to dispatch and reduce actions.
 * It must be added to the SuperStore by calling [.addStore](SuperStore.html#addStore)
 *  or [.addStores](SuperStore.html#addStores)
 * @type {Object}
 */
class Store {
  constructor(initialState = {}) {
    this.state = initialState
    this._dispatcher = null
    this.listeners = []
  }

  /**
   * Runtime initialization of the dispatcher
   * and the vm. At any point a store can become self-sufficient
   * by calling this function. The global dispatcher will be override
   * with the stores' local one and a Vue vm will be spawned to handle
   * the state reactivity
   *
   */
  initialize() {
    this._dispatcher = new Dispatcher()    
    this._dispatcher.register(this.reduce)
    this.createVueVM()    
  }

   // start a Vue vm to make the state reactive
   createVueVM() {
    this.vm = new Vue({
      data: {
        state: this
      }
    })
  }

  /**
   * Get the current state
   * 
   * @return {Object} A copy of the current state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state))
  }

  /**
   * This function let the user subscribe to the state changing. 
   * Example: 
   * 
   * ```javascript
   * var unsubscribe = Store.subscribe(subscribeFunction)
   * unsubscribe()
   * ```
   * 
   * @param {Function} func A callback that will be called everytime the state is changed
   * @return {Function} A unsubscribe function.
   */
  subscribe(func) {
    if (typeof func != 'function')
      throw new Error(StoreError.INVALID_SUBSCRIBER)

    this.listeners.push(func)
    // return a unsubscribe function
    return () => this.listeners.splice(this.listeners.indexOf(func), 1)
  }

  notify() {
    this.listeners.forEach(listener => listener(this))
  }

  /**
   * This function is used to dispatch actions,
   * it is a wrapper around _dispatcher.dispatch
   * in order to provide more options to the client
   * @param  {Object} action Action instance, or an Action-like vanilla object
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
      // the type is required in order to identify the action
      if (action.type) {
        return this._dispatcher.dispatch(action).then(() => this.notify())
      }
    
    throw new Error(StoreError.INVALID_ACTION)
  }

  /**
   * This function can be called in order to create a Action instance
   * without have to import Action from Flue
   * 
   * @param {String} type The type of the action
   * @param {Object} payload The payload of the action
   * 
   * @return {Action} A newly created Action instance
   */
  createAction(type, payload) {
    return new Action(type, payload)
  }

  /**
   * Map each action to the correct function.
   * 
   * Example:
   * 
   * ```javascript
   * this.reduceMap(action, {
   *  ADD_FOOD_TO_SHOPPING_CART: this.addFoodToShoppingCart,
   *  REMOVE_FOOD_FROM_SHOPPING_CART: this.removeFoodFromShoppingCart,
   *  CHECK_OUT: this.checkOut
   * })
   * ```
   * 
   * @param  {Object} action            A action
   * @param  {Object} actionFunctionMap A dictionary with action type as key and function as value
   * @param {String} payloadKey        The key to access to the data part of an Action
   */
  reduceMap(action, actionFunctionMap, payloadKey = 'payload') {
    const func = actionFunctionMap[action.type]
    if (func && func.this !== this)
      func.bind(this)(action[payloadKey])
  }

  /**
   * The reduce function takes a action as input and reduce it
   * by switching behavior based on its type
   * 
   * @param {Object} action A action instance
   */
  reduce(action) {}
  /**
   * The store may expose a object of function that can be called
   * in order to dispatch Actions.
   * 
   * @param {Store} context The store itself is passed as context
   */
  actions(context) {}

}

export default Store
