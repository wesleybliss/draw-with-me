import {
    SET_STARTED,
    SET_ROSTER,
    ADD_HISTORY
} from '../action-types'

const initialState = {
    started: false,
    roster: [],
    history: []
}

const chat = (state = initialState, { type, payload }) => {
    
    switch (type) {
        
        case SET_STARTED:
            return {
                ...state,
                started: payload
            }
        
        case SET_ROSTER:
            return {
                ...state,
                roster: payload
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
