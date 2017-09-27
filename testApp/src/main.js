// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

// import { flue } from '../../source/flue/index.js'
import { flue, Store, SuperStore } from 'flue-vue'

import logger from 'redux-logger'

import taskStore from './TaskStore.js'
import userStore from './UserStore.js'

Vue.use(flue)

flue.applyGlobalMiddleware([logger])

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
