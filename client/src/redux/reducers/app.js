import {
    SET_ONLINE
} from '../action-types'

const initialState = {
    online: false,
    nickname: null
}

const app = (state = initialState, { type, payload }) => {
    
    switch (type) {
        
        case SET_ONLINE:
            return {
                ...state,
                online: payload
            }
        
        default:
            return state
        
    }
    
}

export default app
