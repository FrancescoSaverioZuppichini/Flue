#Flue - Flux + Vue
##Yep, another flux implementatio but with personality

###Installation

```
npm install flue-vue
```
And import in your root component.

```javascript
import {flueVue } from 'flue-vue'

Vue.use(flueVue)
{
// inside a vue component
this.$store
this.$store.actions.something() // call an actions from a store
this.$store.state // access the global shared state
}
```

Then *$store* will be available to all components, just remember to feed the *SuperStore* with each *Store* as it is explained below.

```javascript
import YourStore from './YourStore.js'
import {SuperStore } from 'flue-vue'
SuperStore.addStore(YourStore) // add one
SuperStore.addStores([YourStore,...]) // add multiple
```


###Motivation
*Hey Francesco, why another flux implementation?*

Hi, Friend! This is why. I wanted a Flux micro framework that allows me to use *classes* and does *what I want*. Vuex is really cool, but it force you to write code with tonnes of constraints. So I decided to write my own. 

Let's see it together.

###Flue, what the hell is it?
Flue combines the Redux single state paradigm and stateless reducers into a friendly environment. It uses the Vue Virtual Machine in order to automatically make "reactive" the store's state so no binding/event emitting is needed. You take it, you put in your component and it works.

###Seems cool, an example?
Before taking a look at the API let's show to short example. May I introduce you to the *DummyStore*

```javascript
import { Action, SuperStore, Store } from 'flue-vue'

class DummyStore extends Store {
    constructor() {
        super()
        this.state.text = ""
    }

    reduce(action) {
        this.reduceMap(action, {
            DUMMY: ({ text }) => { this.state.text = text }
        })
    }

    actions(context) {
        return {
            fetchDummy() {
                context.dispatch(new Action("DUMMY", { text: "dummy" }))
            }
        }
    }
}

const dummyStore = new DummyStore()
export default dummyStore
```

We can notice three things. Our *DummyStore* extends the **Store** class and we have two functions: **reduce** and **actions** (You can gess what they do).

##Store
A store is a single logic unit that does the dirty work for the components in order to provide a meaningful API structure. A store is composed of two parts:
###Actions
Each Store can implement the **actions** function to return an Object of actions. This special function is fetched by the **SuperStore**  and flat into a common object in order to provide a global API interface for the components. Actions can be called directly from the *$store* pointer inside a component. Following our previous example:

```javascript
{
\\inside a component
this.$store.actions.fetchDummy()
}
```

The context is passed to actions in order to call the store's method from the actions.

Remember that you can always create a single action and dispatch it using `store.dispatch` method.

```javascript
import {aStore} from 'aStore.js'

const anAction = {type:'FOO',payload:{}} //classic way
const anAction = new Action('FOO',{}) // explicit way, the payload can be remove if empty
const anAction = aStore.createAction('FOO',{})

aStore.dispatch(anAction)

//or you can use the SuperStore

import {SuperStore} from 'flue-vue'
SuperStore.dispatch(anAction)
```


###Reduce
The other important function is the 'reduce', it is automatically registered by Flue into the global dispatcher. What does it? It reduces the actions. It receive an action as argument and switch behavior accordently on the action's type. Usually a *switch* statement is used. In our example:
```javascript
 reduce(action) {
     switch (action.type) {
             case "DUMMY":
             ....
    }
```

We can also use a helper function, **reduceMap** that create a map with actions' types and function

```javascript
 reduce(action) {
        this.reduceMap(action, {
            DUMMY: ({ text }) => { this.state.text = text }
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


###What else?
Since we are using classes we can split the code, create helpers function and wather we want.

##SuperStore
Imagine a supermarket, it contains tonnes of small shops, everyone of them does something specific job like sell foods or shoes, but they are organized by the same supermarket. That's the Idea of the SuperStore. When you import Flue you automatically import also a **unique** *SuperStore* class that keep a **state** with all the store's states. In the end of our dummyStore you can see:

```
SuperStore.addStore(dummyStore)
```
The SuperStore class takes a **Store** instances and, in order:

* puts the Store's state into its state
* puts the Store's actions into its actions
* keep a reference to the Store object 
* override the state pointer of the Store whit its state
* puts a reference of itself into the store

That's a lot of stuff. So what actually happens is that the single Store is put into the SuperStore, to continue with our methapore we can say that the shop is put into the supermarket. So, after called ```SuperStore.addStore(dummyStore)``` we can do the follow:

```
SuperStore.actions.fetchDummy() //called action from the dummyStore
SuperStore.state.text // access the state form the SuperStore ("text')
SuperStore.DummyStore // this is the reference to the DummyStore, it is saved by constructor name
dummyStore.sStore //  this is the reference to the SuperStore from the dummyStore
```
In every Vue componenets the SuperStore can be access through **$store**. 

```javascript
this.$store
this.$store.actions.something() // call an actions from a store
this.$store.state // access the global shared state```

###Why?
By doing that we can pass to each Vue components the single SuperStore instance, called for simplicity **$store**, and be able to access to all the stores, actions and state.
###Stateless
Since the Store's state is overridden by the SuperStore's one we can say that each store his stateless since it is not the owner of his state, but you can argue that this is tricky and you are right.

##Actions
For simplicity, we provide an **Action** class in order to simplify the syntax. Each action is composed of a type and a payload. This is mandatory if you want to use the *reduceMap* since his payload object is passed to all the functions. You can always do what you want, just do not call *reduceMap* then.

##Middleweres
For convinience we used the same code Redux does, so in theory their middlewere should work since we have the same APIs. We have tried the logger as you can find in the example. To create a middlewere just follow the redux tutorial. A full example:

```
import {SuperStore} from 'flue-vue'
import DummyStore from './DummyStore'
import logger from 'redux-logger'
import { apiMiddleware } from 'redux-api-middleware';
SuperStore.addStore(DummyStore)
SuperStore.applyMiddleware(DummyStore,[logger]) //apply middleware to a specific store
SuperStore.applyGlobalMiddlewere([apiMiddleware, logger]) //apply middlewere to all the stores
```
You can apply a middlewere to a specific store or to an array of stores by calling **applyMiddleware(store/[stores],[middleweres])**. Or you can apply a global middlewere to all the stores by calling **applyGlobalMiddlewere([middleweres])**.

##Example
You can check out [here](https://github.com/FrancescoSaverioZuppichini/flueVueExample) or in the ```test/examples``` folder.
