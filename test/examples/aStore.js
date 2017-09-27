
import { flue, Store } from 'flue-vue'

class HelloWorld extends Store{

    retuce(action){
        console.log(action.type)
    }
}

flue.addStore(HelloWorld)

