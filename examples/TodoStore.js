import {
    Action,
    SuperStore,
    Store
} from '../flue/flue.js'

class TodoStore extends Store {
    constructor() {
        super()
        this.state = {}
        this.state.todos = []
        this.state.nTodos = 0
    }

    addTodo({newTodo}) {
        this.state.todos.push(newTodo)
        this.state.nTodos++
    }

    displayTodoNotDone() {
        this.state.todos.forEach(todo => todo.display = !todo.done)
    }
    displayTodoDone() {
        this.state.todos.forEach(todo => todo.display = todo.done)
    }

    displayAllTodos() {
        this.state.todos.forEach(todo => todo.display = true)
    }
    // getters do not change the state
    getAllTodoNotDone() {
        return this.state.todos.filter(todo => !todo.done)
    }

    getAllTodoDone() {
        return this.state.todos.filter(todo => todo.done)
    }

    reduce(action) {
        this.reduceMap(action, {
            ADD_TODO_SUCCESS: this.addTodo,
            DISPLAY_TODO_DONE: this.displayTodoDone,
            DISPLAY_TODO_NOT_DONE: this.displayTodoNotDone,
            DISPLAY_ALL_TODO: this.displayAllTodos
        })
        // switch (action.type) {
        //     case "ADD_TODO_SUCCESS":
        //         this.addTodo(action.payload)
        //         break;
        //     case "DISPLAY_TODO_DONE":
        //         this.displayTodoDone()
        //         break;
        //     case "DISPLAY_TODO_NOT_DONE":
        //         this.displayTodoNotDone()
        //         break;
        //     case "DISPLAY_ALL_TODO":
        //         this.displayAllTodos()
        //     default:
        //
        // }
    }
    // actions takes the dispacher and the store back from the superStore,
    // so we can call our function as soon as we dispatch
    actions(dispacher, context) {
        return {
            addTodo(newTodo) {
                dispacher.dispatch(new Action("ADD_TODO_LOADING"))
                dispacher.dispatch(new Action("ADD_TODO_SUCCESS", {
                    newTodo
                }))
            },
            displayTodoDone() {
                dispacher.dispatch(new Action("DISPLAY_TODO_DONE"))

            },
            displayTodoNotDone() {
                dispacher.dispatch(new Action("DISPLAY_TODO_NOT_DONE"))

            },
            displayAllTodos() {
                dispacher.dispatch(new Action("DISPLAY_ALL_TODO"))
            }
        }
    }
}

export default TodoStore
// const todoStore = new TodoStore()

// SuperStore.addStore(todoStore)
