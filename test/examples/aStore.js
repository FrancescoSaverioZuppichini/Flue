
import { flue, Store } from 'flue-vue'

class HelloWorld extends Store{

    reduce(action){
        console.log(action.type)
    }
}

flue.addStore(new HelloWorld())


