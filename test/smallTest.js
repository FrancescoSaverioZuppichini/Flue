import TodoStore from './examples/TodoStore.js'
import {Action, SuperStore, Store} from '../source/flue/flue.js'

import logger from 'redux-logger'


class TestStore extends Store {
    constructor(){
        super()
        this.state= {}
        this.state.text = ""
    }

    reduce(action){
        this.reduceMap(action,{CHANGE_TEXT: ({text}) => this.state.text = text})
    }

    actions(ctx){
        return {
            changeState() {
                console.log(this);
                ctx.dispatch(ctx.createAction('CHANGE_TEXT',{text:'Hello World'}))
            }
        }
    }
}

const testStore  = new TestStore()


SuperStore.addStore(testStore)

SuperStore.addReducer((action)=>{console.log('Hello from reducer!')})

SuperStore.actions.changeState()

console.log(SuperStore.state.text);