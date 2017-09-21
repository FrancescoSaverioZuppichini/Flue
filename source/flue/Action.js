/**
 * This class represent a Action, 
 * it has a type used as unique identifier and a payload.
 * By convention the type is a string in capital with underscores.
 * For example, this is a valid type: A_VALID_TYPE_STRING
 */
class Action {
  /**
   *  
   * @param {String} type A String that identify the type of the Action
   * @param {Object} payload The data of the Action
   */
  constructor(type, payload) {
    this.type = type
    this.payload = payload || {}
  }
}

export default Action
