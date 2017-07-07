import Action from './Action.js'

const StoreError = {
  DISPATCHER_NOT_INITIALIZED: 'Dispacher must be initialize fist\nBe sure to call .addStore before call dispatch',
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
  }

  getState() {
    return this.state
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
    if (action instanceof Action)
      return this._dispatcher.dispatch(action)
      // check if is a vanilla js object
    if (action.type && action.payload)
      return this._dispatcher.dispatch(action)
  }

  // Explicit dispatch an Action instance
  dispatchAction(type, payload) {
    if (!this._dispatcher)
      throw new 'Dispatcher must be initialize first'
    this._dispatcher.dispatch(this.createAction(type, payload))
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
  reduceMap(action, actionFunctionMap) {
    const func = actionFunctionMap[action.type]
    if (func)
      func.bind(this)(action.payload)
  }

  // Store always provide a reduce, even if it does not anything
  reduce() {}

}

export default Store
