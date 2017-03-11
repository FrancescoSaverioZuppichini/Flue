/**
 * Dispatcher
 *
 * The dispatcher is a centralized registry of callbacks. Callbacks are
 * registered (typically by data stores) so that they can receive data from
 * other parts of the application (typically views and controller views). The
 * dispatcher responds to an action by receiving a payload of data and sending
 * it to every callback in the registry.
 *
 * The dispatcher can also manage dependencies between callbacks by allowing
 * them to wait for other callbacks to finish.
 *
 * Based on Facebook's todomvc-flux example project
 * https://github.com/facebook/react/blob/master/examples/todomvc-flux/js/dispatcher/Dispatcher.js
 */

var Promise = Promise || require('es6-promise').Promise;

class Dispatcher {

  constructor() {
    // Callbacks added via `register()`
    this._callbacks = [];

    // Array of promises to be populated and cleared on each dispatch
    this._promises = [];
    this._isDispatching = false
    this._readyPromise;
  }

  /**
   * Register a callback with the dispatcher.
   * @param {Function} callback - The callback to be registered.
   * @returns {Integer} The index of the callback within the _callbacks array.
   */
  register(callback) {
    this._callbacks.push(callback);
    return this._callbacks.length - 1; // index
  }

  /**
   * Dispatch a payload of data to every registered callback
   * @param {Object} payload - The data to be dispatched._readyPromise
   * @returns {Promise} A promise that resolves when all the callbacks
   *                    have completed. Resolves to the value of the payload.
   */
  dispatch(payload) {
    this._isDispatching = true;

    // Create array of resolve and reject callbacks corresponding to `_promises`
    var resolves = [];
    var rejects = [];

    // Populate `_promises` with "empty" promises corresponding to each
    // callback. Promises are created before callbacks are invoked so that
    // waitFor() can reference them regardless of callback order.
    this._promises = this._callbacks.map(function(_, i) {
      return new Promise(function(resolve, reject) {
        resolves[i] = resolve;
        rejects[i] = reject;
      });
    });

    // Now that the promises have been created, we can dispatch the payload
    // to the callbacks
    this._callbacks.forEach(function(callback, i) {
      // Callbacks can return either an object, to resolve, or a promise, to
      // chain. To normalize the response, we wrap it in a promise object and
      // immediately resolve it using Promise.resolve(). The next part is a bit
      // confusing: we then resolve the promise from the `_promises` array,
      // using the resolves and rejects we saved above. Note that these are two
      // different promises we're dealing with.

      // Wrap the response from the callback in a promise
      Promise.resolve(callback(payload))
        // Resolve or reject promise from `promises` array
        .then(function() {
          resolves[i](payload)
        })['catch'](function(error) {
          rejects[i](error);
        });
    });

    // Return a promise that resolves when all the callbacks have completed.
    return this._readyPromise = Promise.all(this._promises)
      .then(function() {
        return payload;
      });
  }

  /**
   * Wait for the specified registered callbacks to complete. This only works
   * called within the body of a registered callback.
   *
   * If no callback is passed, a promise is returned.
   *
   * @param {Array<Integers>} promiseIndices - The indices of promises to
   *                                           wait for.
   * @param {Function} [callback] - A callback to invoke on completion.
   * @returns {Promise} A promise that resolves when the selected callbacks
   *                    have completed.
   */
  waitFor(promiseIndices, callback) {
    var selectedPromises = promiseIndices.map((index) => {
      return this._promises[index];
    });

    var combinedPromise = Promise.all(selectedPromises);

    if (typeof callback === 'undefined') {
      return combinedPromise;
    } else {
      return combinedPromise.then(callback);
    }
  }
}

export default Dispatcher;
