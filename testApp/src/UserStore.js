import {Store} from 'flue-vue'
import {Resource} from 'resource-class'
import axios from 'axios'
import Vue from 'vue'

class UserStore extends Store {
  constructor() {
    super()
    this.state.users = new Resource()
  }

  onGetUsersSuccess({data}) {

    this.state.users.fromArray(data.results, 'email')
  }

  onDeleteUser({user}) {
    this.state.users.remove(user.email)
  }

  onBookmarkUser({user}) {
    Vue.set(user, 'bookmarked', !user.bookmarked)
  }

  reduce(action) {
    this.reduceMap(action, {
      GET_USERS_SUCCESS: this.onGetUsersSuccess,
      DELETE_USER: this.onDeleteUser,
      BOOKMARK_USER: this.onBookmarkUser
    })
  }

  actions(ctx) {
    return {
      getUsers() {
        axios.get('https://randomuser.me/api/?results=12').then(data => ctx.dispatchAction('GET_USERS_SUCCESS', data))

      },
      deleteUser(user) {
        ctx.dispatchAction('DELETE_USER', {user})
      },
      bookmarkUser(user) {
        ctx.dispatchAction('BOOKMARK_USER', {user})
      }
    }
  }
}

const userStore = new UserStore()
export default userStore
