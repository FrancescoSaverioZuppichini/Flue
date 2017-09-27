// import { Store } from '../../source/flue/index.js'

import { Store, flue } from 'flue-vue'

class TaskStore extends Store {
  constructor() {
    super()
    this.state = {
      tasks: []
    }
  }

  actions(ctx) {
    return {
      addTask(task) {
        ctx.dispatchAction('ADD_TASK', {
          task
        })
      }
    }
  }
}

const taskStore = new TaskStore()

flue.addStore(taskStore)

export default taskStore;
