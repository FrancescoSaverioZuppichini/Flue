# Flue - Flux + Vue
## Yep, another flux implementation

[Francesco Saverio Zuppichini](https://francescozuppichini.carrd.co/ )

### What it is?

Flue is flux-pattern based state management library for your Vue.js applications. 

### Installation

```bash
npm install -S flue-vue
```
And import in your root component.

```javascript
import { flue } from 'flue-vue'

Vue.use(flue)
```

After that, *Flue*  will be available as *$store*  inside any component.

```javascript
//SomeVueComponent.vue
export default {
    data() { ... }
    // inside a vue component
    this.$store
    this.$store.actions.something() // call an actions from a store
    this.$store.state // access the global shared state
}
```

To add a store to  *Flue*

```javascript
import yourStore from './YourStore.js'
import { flue } from 'flue-vue'
flue.addStore(yourStore) // add one
flue.addStores([yourStore, ...]) // add multiple
```

### Introduction
Flue is flux-pattern based state management library for your Vue.js applications. 

You do not know what Flux pattern is? Take a look [here](https://facebook.github.io/flux/docs/overview.html)

Flue is a Object Oriented Framework that combines the Redux single state paradigm and stateless reducers into a friendly environment. It uses a Vue Virtual Machine in order to automatically make "reactive" the store's state so no binding/event emitting is needed. You take it, you put in your component and it works. 

### Quick Start
Let's show a short example in order to introduce you to the basic concepts. This is how you create a *Store*

```javascript
import { flue, Store } from 'flue-vue'

// You need to extend the Store class
class WelcomeToFLue extends Store {
    constructor () {
        super()
        this.state.hasSaidWelcome = false
    }

    reduce (action) {
        this.reduceMap(action, {
            SAY_WELCOME: ({ text }) => {
                console.log("Welcome to Flue")
                this.state.hasSaidWelcome = true 
            }
        })
    }

    actions(ctx) {
        return {
            sayWelcome () {
                ctx.dispatchAction('SAY_WELCOME')
            },
        }
    }
}

const welcomeToFlue = new WelcomeToFLue()
// add it to flue
flue.addStore(welcomeToFlue)
// then the actions can be directly called
flue.actions.sayWelcome() // "Welcome to Flue"

console.log(flue.state.hasSaidWelcome) // true

```

## Store

Each Store must be created by extending the *Store* class exposed by Flue, it provides a common interface to reduce and fire actions.

### State

The state *must* be initialised into the constructor in order to make it reactive. Otherwise `Vue.set()` must be called everytime a new entry is added into it. In our example

```javascript
constructor () {
        super()
        this.state.hasSaidWelcome = false
}
```
We initialize the state by setting `hasSaidWelcome` to `false`

The state can be also passed in the constructor

```javascript
const initialState = { foo: 'foo' }
new Store(initialState)
```
### Reduce

Each Store can implement the `reduce` method that receives an action as argument and switch behavior accordingly on the its type. Usually, a *switch* statement is used. 

By following our example:

```javascript
    reduce (action) {
        switch (action.type) {
            case 'SAY_WELCOME': ({ text }) => {
                console.log("Welcome to Flue")
                this.state.hasSaidWelcome = true 
            }
        })
    }
```
**reduceMap** can be also used to create a map with an actions types and functions. 

```javascript
    reduce (action) {
        this.reduceMap(action, {
            SAY_WELCOME: ({ text }) => {
                console.log("Welcome to Flue")
                this.state.hasSaidWelcome = true 
            }
        })
    }
```
It makes the code faster to write. An other example:

```javascript
this.reduceMap(action, {
    ADD_FOOD_TO_SHOPPING_CART: this.addFoodToShoppingCart,
    REMOVE_FOOD_FROM_SHOPPING_CART: this.removeFoodFromShoppingCart,
    CHECK_OUT: this.checkOut
})
```

### Actions


Each Store can implement the **actions** function to return an Object of actions. In our example:

```javascript
actions(ctx) {
    return {
        sayWelcome () {
            ctx.dispatchAction('SAY_WELCOME')
        },
    }
}
```

This special function is fetched by **flue**  and flat into a common object in order to provide a global API interface for the components. Actions can be called directly from the *$store* pointer inside a component. Following our previous example:

```javascript
export default {
    \\inside a component
    this.$store.actions.sayWelcome()
}
```

The context is passed to actions in order to call the store's method from the actions.

Remember that you can always create a single action and dispatch it using `store.dispatch()` method.

```javascript
import { aStore } from 'aStore.js'

const anAction = { type: 'FOO', payload: {} } // the classic way
const anAction = new Action('FOO', {}) // the explicit way, when the payload can be removed if it is empty
const anAction = aStore.createAction('FOO', {})

aStore.dispatch(anAction)

//or you can use flue

import { flue } from 'flue-vue'

flue.dispatch(anAction)
```

### Subscribe

For convenience is it possible to subscribe for updates in any store. Since we are using a promise base dispatcher, then also async operations are support and the listeners will be called at the right time. 

```javascript
flue.subscribe((store) => { console.log(store.state) }) \\ subscribe to the global store

aStore.subscribe((store) => { console.log(store.state) }) \\ subscribe to a specific store
```

### What else?
For more deep understanding you can read the [documentation page](Store.html) about the `Store` class.

## Flue
Flue contains all the stores, it fetches each individual state making reactive and sharing it back. It is a single [*SuperStore*](SuperStore.html) instance.
In order to add a *Store* to Flue you need to call `SuperStore.addStore` or `SuperStore.addStores`. Usually, this is done at the root of your application

```javascript
import yourStore from './yourStore.js'

flue.addStore(yourStore) //now yourStore will be available
```
### Providers

It may be convenient to add some external package directly into Flue in order to make them available at all the stores and components. An example using [axios](https://github.com/mzabriskie/axios) a well know promised based HTTP client.

```javascript
import axios from 'axios' 

flue.addProvider({ key: 'client', source: axios })

flue.providers.client.get(...)
```

## Actions
We also provide an **Action** class. Each action is composed of a type and a payload. You can always do what you want, just do not call [*reduceMap*](Store.html#reduceMap) then.

## Middleware
*You can use Redux middleware*. In the following example, you can see how to add the classic **redux-logger** middleware to Flue.

```javascript
import { flue } from 'flue-vue'
import Store1 from './Store1.js'

import logger from 'redux-logger'

flue.addStore(Store1)
flue.applyGlobalMiddleware([apiMiddleware, logger]) // apply middlewere to all the stores
```

A full example that exposes all the APIs.
```javascript
import { flue } from 'flue-vue'
import Store1 from './Store1.js'

import logger from 'redux-logger'
import { apiMiddleware } from 'redux-api-middleware'

flue.addStore(Store1)
flue.applyMiddlewareToStore(Store1, [logger]) // apply middleware to a specific store
flue.applyMiddlewareToStores([Store1,...], [logger]) // apply middleware to an flue of stores
flue.applyGlobalMiddleware([apiMiddleware, logger]) // apply middlewere to all the stores
```

To create a middleware just follow the [redux tutorial](http://redux.js.org/docs/advanced/Middleware.html).

## Example
You can check out [here](https://francescosaveriozuppichini.github.io/resource-users-wall-example/) in order to see a full real-life scenario (open the console to see the logger) or in the **`test/examples`** folder.
