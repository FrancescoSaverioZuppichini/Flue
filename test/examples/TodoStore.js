import {
    Action,
    flue,
    Store
} from '../../source/flue/index.js'

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
    actions(dispatcher, context) {
        return {
            addTodo(newTodo) {
                dispatcher.dispatch(new Action("ADD_TODO_LOADING"))
                dispatcher.dispatch(new Action("ADD_TODO_SUCCESS", {
                    newTodo
                }))
            },
            displayTodoDone() {
                dispatcher.dispatch(new Action("DISPLAY_TODO_DONE"))

            },
            displayTodoNotDone() {
                dispatcher.dispatch(new Action("DISPLAY_TODO_NOT_DONE"))

            },
            displayAllTodos() {
                dispatcher.dispatch(new Action("DISPLAY_ALL_TODO"))
            }
        }
    }
}

export default TodoStore
// const todoStore = new TodoStore()

// SuperStore.addStore(todoStore)
