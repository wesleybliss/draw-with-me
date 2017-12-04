import {
    SET_WS,
    SET_WS_ERROR,
    SET_ONLINE,
    SET_NICKNAME,
    SET_ROSTER
} from '../action-types'

const initialState = {
    ws: null,
    wsError: null,
    online: false,
    nickname: '',
    roster: []
}

const app = (state = initialState, { type, payload }) => {
    
    switch (type) {
        
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
        
        case SET_ONLINE:
            return {
                ...state,
                online: payload
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
        
        default:
            return state
        
    }
    
}

export default app
