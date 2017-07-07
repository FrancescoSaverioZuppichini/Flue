import TodoStore from './examples/TodoStore.js'
import {Action, SuperStore, Store} from '../source/flue/flue.js'

import logger from 'redux-logger'
// const store = createStore(
//   reducer,
//   applyMiddleware(logger)
// )


var assert = require('assert');

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
        // dispatcher.dispatch(new Action("DUMMY", {text: "dummy"}))
        // ctx.dispatch("DUMMY", {text: text || "dummy"})
        ctx.dispatch(new Action("DUMMY", {text: text || "dummy"}))
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


function dummyAction(stuff) {
  return {type: 'DUMMY_ACTION', payload: {
      stuff
    }}
}

SuperStore.addStore(dummyStore)

SuperStore.applyMiddleware(dummyStore,[logger])


SuperStore.actions.fetchDummy()
SuperStore.actions.fetchDummy('hey')
SuperStore.actions.fetchDummy('hey2')
SuperStore.actions.fetchDummy('dummy')


// dummyStore.dispatch(dummyAction('ciaone'))


// dummyStore.dispatch(new Action('test', {'a': 'b'}))
// dummyStore.dispatch('test', {'a': 'b'})

const randomActions = (dispatcher, ctx) => {
  return {
    randomAction() {
      console.log('randomAction')
    }
  }
}

function fruitReducer(action) {
  this.reduceMap(action, {
    'ADD_FRUIT': ({fruit}) => {
      console.log(fruit)
    }
  })
}

function addFruit(fruit) {return {type:'ADD_FRUIT',payload:{fruit:'banana'}}}

SuperStore.addStore(fruitReducer)
SuperStore.dispatch(addFruit())
SuperStore.addActions(randomActions)
SuperStore.actions.randomAction()
SuperStore.actions.fetchDummy()

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
});

describe('SuperStore', () => {
  describe("addStore", () => {
    it("should add a Store to itself", () => {
      SuperStore.addStore(dummyStore)
      assert.equal(SuperStore.DummyStore, dummyStore)
      assert.equal(SuperStore.state.dummy, dummyStore.state.dummy)
      assert.ok(SuperStore.this === dummyStore.sSuper)
      assert.notEqual(dummyStore._dispachToken, null)
    })
  })
  describe("addStores", () => {
    it("should add stores to itself", () => {
      const todoStore = new TodoStore()
      SuperStore.addStores([todoStore, dummyStore])
      assert.equal(SuperStore.TodoStore, todoStore)
      assert.equal(SuperStore.DummyStore, dummyStore)
    })
  })
  describe("actions", () => {
    it("should dispatch an action and change the state", () => {
      SuperStore.initialize()
      SuperStore.addStore(dummyStore)
      // console.log(SuperStore)
      SuperStore.actions.fetchDummy()
      SuperStore.actions.fetchDummy()
      SuperStore.actions.fetchDummy()

      assert.equal(SuperStore.state.text, "dummy")
      // console.log(SuperStore.state)
    })
  })
})

describe("TodoStore", () => {
  const todoStore = new TodoStore()

  before(function() {
    SuperStore.initialize()
    SuperStore.addStore(todoStore)
  });

  describe("addTodo", () => {
    it("should add a new todo to the state", () => {
      const newTodo = {
        done: false,
        text: "hey"
      }
      SuperStore.actions.addTodo(newTodo)
      assert.ok(SuperStore.state.todos.length == 1)
      assert.equal(SuperStore.state.todos[0], newTodo)
    })
  })
  describe("displayTodoNotDone", () => {
    it("should display all todo not done", () => {

      const newTodo = {
        done: true,
        text: "hey"
      }
      SuperStore.actions.addTodo(newTodo)
      assert.ok(SuperStore.state.todos.length == 2)
      assert.equal(SuperStore.state.todos[0].text, newTodo.text)
      SuperStore.actions.displayTodoNotDone()
      assert.ok(todoStore.getAllTodoNotDone().length == 1)

    })
  })
  describe("displayTodoDone", () => {
    it("should display all todo not done", () => {
      assert.ok(SuperStore.state.todos.length == 2)
      SuperStore.actions.displayTodoDone()
      assert.ok(todoStore.getAllTodoDone().length == 1)

    })
  })
  describe("displayAllTodos", () => {
    it("should display all todos, done and not done", () => {
      const newTodo = {
        done: true,
        text: "hey"
      }
      SuperStore.actions.addTodo(newTodo)
      assert.ok(SuperStore.state.todos.length == 3)
      SuperStore.actions.displayAllTodos()
      for (let todo of SuperStore.state.todos) {
        assert.ok(todo.display)
      }

    })
  })
})
