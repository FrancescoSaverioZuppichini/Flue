import FoodStore from './examples/FoodStore.js'
import TodoStore from './examples/TodoStore.js'
import {
    Action,
    SuperStore,
    Store
} from '../source/flue/flue.js'

var assert = require('assert');

class DummyStore extends Store {
    constructor() {
        super()
        this.state.text = ""
    }

    reduce(action) {
        this.reduceMap(action, {
            DUMMY: ({ text }) => { this.state.text = text }
        })
    }

    actions(dispacher, context) {
        return {
            fetchDummy() {
                dispacher.dispatch(new Action("DUMMY", { text: "dummy" }))
            }
        }
    }
}

const dummyStore = new DummyStore()

describe('Action', () => {
    describe("Create a new Action", () => {
        it("should have a type and payload", () => {
            const newAction = new Action("TEST", {
                test: "test"
            })
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
            const a = testStore.createAction("TEST", {
                test: "test"
            })
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
