import TodoStore from './examples/TodoStore.js'
import {Action, flue, Store} from '../source/flue/index.js'

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
        flue.dispatch(new Action('TEST'))
      } catch (e) {
        assert.ok(false)
      } finally {
        assert.ok(true)
      }

    });
    it('should dispatch an Action object-like', function() {
      try {
        flue.dispatch({type: 'RANDOM', payload: {}})
      } catch (e) {
        assert.ok(false)
      } finally {
        assert.ok(true)
      }

    });
    it('should not dispatch an wrong Action', function() {
      var failed = false
      try {
        flue.dispatch('asdas')
      } catch (e) {
        failed = true
      } finally {
        assert.ok(failed)
      }

      failed = false

      try {
        flue.dispatch()
      } catch (e) {
        failed = true
      } finally {
        assert.ok(!failed)
      }

      try {
        flue.dispatch(null)
      } catch (e) {
        failed = true
      } finally {
        assert.ok(!failed)
      }

      try {
        flue.dispatch({})
      } catch (e) {
        failed = true
      } finally {
        assert.ok(failed)
      }
    });

  });
});

describe('flue', () => {
  describe("addStore", () => {
    it("should add a Store to itself", () => {
      flue.addStore(dummyStore)
      assert.equal(flue.state.text, dummyStore.state.text)
      assert.ok(flue.this === dummyStore.sSuper)
      assert.notEqual(dummyStore._dispachToken, null)
    })
  })
  describe("addStores", () => {
    it("should add stores to itself", () => {
      const todoStore = new TodoStore()
      const testStore2 = new Store()

      const lengthOfStoresBeforeAdd = flue.stores.length

      flue.addStores([todoStore, testStore2])

      const lengthOfStoresAfterAdd = flue.stores.length

      assert.ok(lengthOfStoresBeforeAdd < lengthOfStoresAfterAdd)
    })
  })
  describe("addReducer", () => {
    it("should add a reduce function to itself", () => {
      const lengthOfStoresBeforeAdd = flue.stores.length
      
      flue.addReducer((action) => {})
     
      const lengthOfStoresAfterAdd = flue.stores.length
      
      assert.ok(lengthOfStoresBeforeAdd < lengthOfStoresAfterAdd)
      
    })
  })
  describe("actions", () => {
    it("should dispatch an action and change the state", () => {
      // flue.initialize()
      // flue.addStore(dummyStore)
      // console.log(flue)
      flue.actions.fetchDummy()
      assert.equal(flue.state.text, "dummy")

    })
    it("should dispatch an async action and change the state", () => {
      flue.actions.fetchDummyAsync('async')
      setTimeout(() => {
        assert.equal(flue.state.text, "async")
      }, 1100)
    })
  })
  describe("addActions", () => {
    it("should add an actions to flue", () => {
      flue.addActions({ test: () => { 
        assert.ok(true)
        flue.dispatchAction('TEST')
       } })
       
      flue.actions.test()
    })
  })
  describe("applyMiddleware", () => {
    it("should apply a middleware to the store", () => {

      const logger = (store) => next => action => {
        assert.ok(true)
        let result = next(action)
        return result
      }
      flue.applyGlobalMiddleware([logger])
      flue.applyMiddlewareToStore(dummyStore, [logger])
      flue.actions.fetchDummy()
    })
  })
  describe("subscribe", () => {
    it("should trigger a change when an action is distpached", () => {
      
      const func = (ctx) => {
        assert.equal(ctx.state.text, "subscribe")
      }

      const unsubscribe = flue.subscribe(func)
      flue.actions.fetchDummy('subscribe')

    })
  })
})
