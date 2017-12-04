import {
    SET_STARTED,
    ADD_HISTORY
} from '../action-types'

const initialState = {
    started: false,
    history: []
}

const chat = (state = initialState, { type, payload }) => {
    
    switch (type) {
        
        case SET_STARTED:
            return {
                ...state,
                started: payload
            }
        
        case ADD_HISTORY:
            return {
                ...state,
                history: [
                    ...state.history,
                    payload
                ]
            }
        
        default:
            return state
        
    }
    
}

export default chat
