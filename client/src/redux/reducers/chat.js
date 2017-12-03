import {
    SET_STARTED,
    SET_WS,
    SET_WS_ERROR,
    SET_NICKNAME,
    SET_ROSTER,
    ADD_HISTORY
} from '../action-types'

const initialState = {
    ws: null,
    wsError: null,
    started: false,
    nickname: '',
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
        
        case SET_WS:
            return {
                ...state,
                ws: payload
            }
        
        case SET_WS_ERROR:
            return {
                ...state,
                wsError: payload
            }
        
        case SET_NICKNAME:
            return {
                ...state,
                nickname: payload
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
