import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk'
import createHistory from 'history/createBrowserHistory'
import state from '../reducers'

export const history = createHistory()

const middleware = [
    thunk,
    routerMiddleware(history)
]

const enhancers = []

if (process.env.NODE_ENV === 'development') {
    
    const devToolsExtension = window.devToolsExtension
    
    if (typeof devToolsExtension === 'function')
        enhancers.push(devToolsExtension())
    
}

const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
)

const configureStore = initialState =>
    createStore(
        state,
        initialState,
        composedEnhancers
    )

export default configureStore
