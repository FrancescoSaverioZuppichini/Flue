import TodoStore from './examples/TodoStore.js'
import {Action, flue, Store} from '../source/flue/index.js'

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


flue.addStore(testStore)

flue.addReducer((action)=>{console.log('Hello from reducer!')})

flue.actions.changeState()

console.log(flue.state.text);