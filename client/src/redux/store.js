import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import state from './reducers'

export const history = createHistory()

const middleware = [
    /*thunk,*/
    routerMiddleware(history)
]

const enhancers = []

const initialState = {
    app: {
        online: false,
        nickname: null
    }
}

if (process.env.NODE_ENV === 'development') {
    
    const devToolsExtension = window.devToolsExtension
    
    if (typeof devToolsExtension === 'function')
        enhancers.push(devToolsExtension())
    
}

const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
)

const store = createStore(
    state,
    initialState,
    composedEnhancers
)

export default store