import {
  Action,
  flye,
  Store
} from 'source/flue/index.js'

class FoodStore extends Store {
  constructor() {
    super()
    this.state = {}
    this.state.foodTypes = ["banana", "pasta", "pizza"]
    this.state.shoppingCart = []
    this.state.checkOutCart = []
  }

  isFoodInShoppingCart(foodType) {
    return this.state.shoppingCart.indexOf(foodType) >= 0
  }

  removeFoodFromShoppingCart(payload) {
    const foodIndex = this.state.shoppingCart.indexOf(payload.foodType)
    this.state.shoppingCart.splice(foodIndex, 1)
  }

  addFoodToShoppingCart(payload) {
    this.state.shoppingCart.push(payload.foodType)
  }

  checkOut() {
    this.state.checkOutCart = [...this.state.shoppingCart]
    this.state.shoppingCart.length = 0
  }

  reduce(action) {
    // helper method to fast reduce, action.payload is pass to all the function
    this.reduceMap(action, {
      ADD_FOOD_TO_SHOPPING_CART: this.addFoodToShoppingCart,
      REMOVE_FOOD_FROM_SHOPPING_CART: this.removeFoodFromShoppingCart,
      CHECK_OUT: this.checkOut
    })
    // You can still do with the old school way
    // switch (action.type) {
    //   case "ADD_FOOD_TO_SHOPPING_CART":
    //     this.addFoodToShoppingCart(action.payload)
    //     break;
    //   case "REMOVE_FOOD_FROM_SHOPPING_CART":
    //     this.removeFoodFromShoppingCart(action.payload)
    //     break;
    //   case "CHECK_OUT":
    //     this.checkOut()
    //     break;
    //   default:
    //
    // }
  }
  // Store expone his actions
  actions(dispatcher) {
    // they can be imported from some other file
    return {
      addFoodToShoppingCart(foodType) {
        // You can use action to spead up the coding
        dispatcher.dispatch(new Action("ADD_FOOD_TO_SHOPPING_CART", {
          foodType: foodType
        }))
      },
      // use arrow function in order to be in the store scope
      removeFoodFromShoppingCart: (foodType) => {
        const action = this.createAction("REMOVE_FOOD_FROM_SHOPPING_CART", {
          foodType: foodType
        })
        dispatcher.dispatch(action)
      },
      checkOut() {
        // Since SuperStore extends Store you can also call the function from there
        const action = SuperStore.createAction("CHECK_OUT")
        dispatcher.dispatch(action)
      }
    }
  }
}

const foodStore = new FoodStore()
export default foodStore
// SuperStore.addStore(foodStore)
