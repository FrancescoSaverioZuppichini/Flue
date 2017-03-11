import Action from './Action.js'

class Store {
    constructor() {
        this._dispachToken
        this.state = {}
    }
    // auto bind each function in the map
    createReduceMap(actionFunctionMap) {
        for (let key in actionFunctionMap) {
            actionFunctionMap[key] = actionFunctionMap[key].bind(this)
        }

        return actionFunctionMap
    }
    // map the action type to the correct handler
    reduceMap(action, actionFunctionMap) {
        const func = actionFunctionMap[action.type]
        if (func) {
            func.bind(this)(action.payload)
        }
    }

    createAction(type, payload) {
        const newAction = new Action(type, payload)
        return newAction
    }

}

export default Store
