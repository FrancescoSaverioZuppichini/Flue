#Flue - Flux + Vue
##Yep, another one but with some personality

###Installation

```
npm install flue-vue
```
And import in your root component. Then *$store* will be available to all components, just remember to feed the *SuperStore* with each *Store* as it is explained below.

###Motivation
*Hey Francesco, why another flux implementation?*

Hi, Friend! This is why. I wanted a Flux micro framework that allows me to use *classes* and does *what I want*. Vuex is really cool, but it force you to write code with tonnes of constraints, that are there for a good reason, of course, but they limit you. So, you know that, I decided to write my own. 

Let's see it together.

###Flue, what the hell is it?
Flue combines the Redux single state and stateless reducers into a friendly environment. It uses the Vue Virtual Machine in order to automatically make "reactive" the store's state so no binding/event emitting is needed. You take it, you put in your component and it works.

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

    actions(dispatcher, context) {
        return {
            fetchDummy() {
                dispatcher.dispatch(new Action("DUMMY", { text: "dummy" }))
            }
        }
    }
}

const dummyStore = new DummyStore()
SuperStore.addStore(dummyStore)
```

If you came from React this should look familiar. We can notice three things. Our *DummyStore* extends the **Store** class and we have two functions: **reduce** and **actions** (You can gess what they do).

##Store
A store is a single logic unit that does the dirty work for the components in order to provide a meaningful API structure. A store is composed of two parts:
###Actions
Each Store must implement the **actions** function in order to return an Object of actions. This special function is fetched by the **SuperStore** (wait wait) and flat into a common object in order to provide a global API interface for the components. 

The function takes two parameters: dispatcher and context. The first one is the classic flux's dispatcher, the second is the Store itself. This is similar to Vuex.

###Reduce
The other important function is the 'reduce', it is automatically registered by Flue into the dispatcher. What does it? It reduces the actions. In our example:

```
 reduce(action) {
        this.reduceMap(action, {
            DUMMY: ({ text }) => { this.state.text = text }
        })
    }
```
It called an helped function from the *Store* superclass in order to create and reduce a function map that allows us to write in a more convenient way. Every function in the map is bound again to the Store object a allow, also, not arrow function. We can still reduce in the old school way:

```
 reduce(action) {
     switch (action.type) {
             case "DUMMY":
             ....
    }
```

We can agree that use a function map is faster.

###What else?
Since the Store is a class we have the power to call whatever function we want, so we can create tonnes of helpers function. In Vuex to keep the code cleaner we need to split the Store into multiple files, here we can just create others classes so the store can *delegate* the work to them. 

##SuperStore
Imagine a supermarket, it contains tonnes of small shops, everyone of them does something specific like sell foods or shoes. But they are organized by the same supermarket. That's the Idea of the SuperStore. When you import Flue you automatically import also a **unique** *SuperStore* class that keep a **state** with all the store's states. In the end of our dummyStore you can see:

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
###Why?
By doing that we can pass to each Vue components the single SuperStore instance, called for simplicity **$store**, and be able to access to all the stores, actions and state.
###Stateless
Since the Store's state is overridden by the SuperStore's one we can say that each store his stateless since it is not the owner of his state, but you can argue that this is tricky and you are right.

##Actions
For simplicity, we provide an **Action** class in order to simplify the syntax. Each action is composed of a type and a payload. This is mandatory if you want to use the *reduceMap* since his payload object is passed to all the functions. You can always do but you want, just do not call *reduceMap* then.

##Example
You can check out [here](https://github.com/FrancescoSaverioZuppichini/flueVueExample) or in the ```test/examples``` folder.
