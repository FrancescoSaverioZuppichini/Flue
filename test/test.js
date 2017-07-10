import TodoStore from './examples/TodoStore.js'
import {Action, SuperStore, Store} from '../source/flue/flue.js'

import logger from 'redux-logger'

var assert = require('assert');

class DummyStore extends Store {
  constructor() {
    super()
    this.state.text = "ciao"
    this.actions.bind(this)
  }

  reduce(action) {
    this.reduceMap(action, {
      DUMMY: ({text}) => {
        this.state.text = text
      }
    })
  }

  actions(ctx) {

    // console.log(ctx);
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



const logger = ({getState}) => next => action => {
  console.log('-----------------')
  console.log('prev state', getState())
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', getState())
  console.log('-----------------\n')
  return result
}

// const checkIfIsNotDummy = store => next => (action) => {
//   console.log('checkIfIsNotDummy')
//   console.log(action);
//   if(action.payload.text != 'dummy') return next(action)
//   console.log('NO DUMMY ')
// }

const dummyStore = new DummyStore()
const todoStore = new TodoStore()
dummyStore.actions()
function dummyAction(stuff) {
  return {type: 'DUMMY_ACTION', payload: {
      stuff
    }}
}

// SuperStore.addStore((action,context)=>{console.log('asddas',context)})

SuperStore.applyMiddleware(dummyStore, [logger])

const randomActions = (dispatcher, ctx) => {
  return {
    randomAction() {
      console.log('randomAction')
    }
  }
}

const randomAction = new Action('RANDOM')

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
        SuperStore.dispatch(randomAction)
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
      assert.equal(SuperStore.DummyStore, dummyStore)
      assert.equal(SuperStore.state.text, dummyStore.state.text)
      assert.ok(SuperStore.this === dummyStore.sSuper)
      assert.notEqual(dummyStore._dispachToken, null)
    })
  })
  describe("addStores", () => {
    it("should add stores to itself", () => {
      const todoStore = new TodoStore()
      const testStore2 = new Store()

      SuperStore.addStores([todoStore, testStore2])
      assert.equal(SuperStore.TodoStore, todoStore)
      // assert.equal(SuperStore.TestStore2, testStore2)
    })
  })
  describe("actions", () => {
    it("should dispatch an action and change the state", () => {
      // SuperStore.initialize()
      // SuperStore.addStore(dummyStore)
      // console.log(SuperStore)
      SuperStore.actions.fetchDummy()
      SuperStore.actions.fetchDummy()
      SuperStore.actions.fetchDummy()

      assert.equal(SuperStore.state.text, "dummy")
      // console.log(SuperStore.state)
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
      SuperStore.applyGlobalMiddlewere([logger])
      // console.log(SuperStore.stores.length)
      SuperStore.applyMiddleware(dummyStore, [logger])
      SuperStore.actions.fetchDummy()
    })
  })
})

// describe("TodoStore", () => {
//   describe("addTodo", () => {
//     it("should add a new todo to the state", () => {
//       const newTodo = {
//         done: false,
//         text: "hey"
//       }
//       SuperStore.actions.addTodo(newTodo)
//       assert.ok(SuperStore.state.todos.length == 1)
//       assert.equal(SuperStore.state.todos[0], newTodo)
//     })
//   })
//
//   describe("displayTodoNotDone", () => {
//     it("should display all todo not done", () => {
//
//       const newTodo = {
//         done: true,
//         text: "hey"
//       }
//       SuperStore.actions.addTodo(newTodo)
//       assert.ok(SuperStore.state.todos.length == 2)
//       assert.equal(SuperStore.state.todos[0].text, newTodo.text)
//       SuperStore.actions.displayTodoNotDone()
//       assert.ok(todoStore.getAllTodoNotDone().length == 1)
//
//     })
//   })
//   describe("displayTodoDone", () => {
//     it("should display all todo not done", () => {
//       assert.ok(SuperStore.state.todos.length == 2)
//       SuperStore.actions.displayTodoDone()
//       assert.ok(todoStore.getAllTodoDone().length == 1)
//
//     })
//   })
//   describe("displayAllTodos", () => {
//     it("should display all todos, done and not done", () => {
//       const newTodo = {
//         done: true,
//         text: "hey"
//       }
//       SuperStore.actions.addTodo(newTodo)
//       assert.ok(SuperStore.state.todos.length == 3)
//       SuperStore.actions.displayAllTodos()
//       for (let todo of SuperStore.state.todos) {
//         assert.ok(todo.display)
//       }
//
//     })
//   })
// })
