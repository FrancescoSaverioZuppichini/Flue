import TodoStore from './examples/TodoStore.js'
import {Action, SuperStore, Store} from '../source/flue/flue.js'

import logger from 'redux-logger'

var assert = require('assert');

class HelloWorld extends Store {
  constructor() {
    super()
    this.state.text = ""
  }

  reduce(action) {
    switch (action.type) {
      case 'HELLO_WORLD':
        this.state.text = action.payload.text
        break;
      default:

    }
    // this.reduceMap(action, {
    //   'HELLO_WORLD': ({text}) => this.state.text = text
    // })
  }

  actions(ctx) {
    return {
      helloWorld() {
        ctx.dispatchAction('HELLO_WORLD', {text: 'Hello World'})
      }
    }
  }
}

const helloWorldStore = new HelloWorld()

class DummyStore extends Store {
  constructor() {
    super()
    this.state.text = "ciao"
  }

  reduce(action) {
    this.reduceMap(action, {
      DUMMY: ({text}) => {
        this.state.text = text
      }
    })
  }

  actions(ctx) {
    return {
      fetchDummy(text) {
        ctx.dispatch(new Action("DUMMY", {
          text: text || "dummy"
        }))
      },
      fetchDummyAsync(text) {
        setTimeout(() => {
          ctx.dispatch(new Action("DUMMY", {
            text: text || "dummy"
          }))
        }, 1000)
      }
    }
  }
}

const testReducer = (action) => {
  console.log(action)
}

const dummyStore = new DummyStore()
const todoStore = new TodoStore()

function dummyAction(stuff) {
  return {type: 'DUMMY_ACTION', payload: {
      stuff
    }}
}


const actionProvider = (ctx) => {
  return {
    testActionsProvider() {
      ctx.dispatch(new Action("TEST_ACTION_PROVIDER"))
    }
  }
}

describe('Action', () => {
  describe("Create a new Action", () => {
    it("should have a type and payload", () => {
      const newAction = new Action("TEST", {test: "test"})
      assert.equal(newAction.type, "TEST")
      assert.equal(newAction.payload.test, "test")
    })
  })
})

describe('Store', function() {
  const testStore = new Store()
  describe('createAction', function() {
    it('should create a new Action TEST with no payload', function() {
      const a = testStore.createAction("TEST")
      assert.notEqual(a, null);
      assert.equal(a.type, "TEST")
      assert.notEqual(a.payload, null)
    });
    it('should create a new Action TEST with payload', function() {
      const a = testStore.createAction("TEST", {test: "test"})
      assert.notEqual(a, null);
      assert.equal(a.type, "TEST")
      assert.notEqual(a.payload, null)
      assert.equal(a.payload.test, "test")
    });
  });
  describe('dispatch', function() {
    it('should dispatch an Action Instance', function() {
      try {
        SuperStore.dispatch(new Action('TEST'))
      } catch (e) {
        assert.ok(false)
      } finally {
        assert.ok(true)
      }

    });
    it('should dispatch an Action object-like', function() {
      try {
        SuperStore.dispatch({type: 'RANDOM', payload: {}})
      } catch (e) {
        assert.ok(false)
      } finally {
        assert.ok(true)
      }

    });
    it('should not dispatch an wrong Action', function() {
      var failed = false
      try {
        SuperStore.dispatch('asdas')
      } catch (e) {
        failed = true
      } finally {
        assert.ok(failed)
      }

      failed = false

      try {
        SuperStore.dispatch()
      } catch (e) {
        failed = true
      } finally {
        assert.ok(!failed)
      }

      try {
        SuperStore.dispatch(null)
      } catch (e) {
        failed = true
      } finally {
        assert.ok(!failed)
      }

      try {
        SuperStore.dispatch({})
      } catch (e) {
        failed = true
      } finally {
        assert.ok(failed)
      }
    });

  });
});

describe('SuperStore', () => {
  describe("addStore", () => {
    it("should add a Store to itself", () => {
      SuperStore.addStore(dummyStore)
      assert.equal(SuperStore.state.text, dummyStore.state.text)
      assert.ok(SuperStore.this === dummyStore.sSuper)
      assert.notEqual(dummyStore._dispachToken, null)
    })
  })
  describe("addStores", () => {
    it("should add stores to itself", () => {
      const todoStore = new TodoStore()
      const testStore2 = new Store()

      const lengthOfStoresBeforeAdd = SuperStore.stores.length

      SuperStore.addStores([todoStore, testStore2])

      const lengthOfStoresAfterAdd = SuperStore.stores.length

      assert.ok(lengthOfStoresBeforeAdd < lengthOfStoresAfterAdd)
    })
  })
  describe("addReducer", () => {
    it("should add a reduce function to itself", () => {
      const lengthOfStoresBeforeAdd = SuperStore.stores.length
      
      SuperStore.addReducer((action) => {})
     
      const lengthOfStoresAfterAdd = SuperStore.stores.length
      
      assert.ok(lengthOfStoresBeforeAdd < lengthOfStoresAfterAdd)
      
    })
  })
  describe("actions", () => {
    it("should dispatch an action and change the state", () => {
      // SuperStore.initialize()
      // SuperStore.addStore(dummyStore)
      // console.log(SuperStore)
      SuperStore.actions.fetchDummy()
      assert.equal(SuperStore.state.text, "dummy")

    })
    it("should dispatch an async action and change the state", () => {
      SuperStore.actions.fetchDummyAsync('async')
      setTimeout(() => {
        assert.equal(SuperStore.state.text, "async")
      }, 1100)
    })
  })
  describe("applyMiddleware", () => {
    it("should apply a middleware to the store", () => {

      const logger = (store) => next => action => {
        assert.ok(true)
        let result = next(action)
        return result
      }
      SuperStore.applyGlobalMiddleware([logger])
      SuperStore.applyMiddlewareToStore(dummyStore, [logger])
      SuperStore.actions.fetchDummy()
    })
  })
  describe("subscribe", () => {
    it("should trigger a change when an action is distpached", () => {

      const func = () => {
        assert.ok(true)
        console.log('s')
      }

      const unsubscribe = SuperStore.subscribe(func)
      SuperStore.actions.fetchDummy()

    })
  })
})
