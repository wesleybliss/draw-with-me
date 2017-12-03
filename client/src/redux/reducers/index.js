import { combineReducers } from 'redux'
import app from './app'
import chat from './chat'

const rootReducer = combineReducers({
    app,
    chat
})

export default rootReducer
