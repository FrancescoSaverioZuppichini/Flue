// import { Store } from '../../source/flue/index.js'

import { Store } from 'flue-vue'

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
export default taskStore;
