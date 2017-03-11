class Action {
  constructor(type, payload) {
    this.type = type
    this.payload = payload || {}
  }
}

export default Action
