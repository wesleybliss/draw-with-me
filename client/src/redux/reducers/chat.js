import {
    SET_STARTED,
    SET_WS,
    SET_WS_ERROR,
    SET_NICKNAME
} from '../action-types'

const initialState = {
    ws: null,
    wsError: null,
    started: false,
    nickname: ''
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
        
        default:
            return state
        
    }
    
}

export default chat
