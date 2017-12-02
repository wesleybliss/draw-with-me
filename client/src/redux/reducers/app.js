import {
    SET_STATUS
} from '../action-types'

const app = (state = [], action) => {
    
    switch (action.type) {
        
        case SET_STATUS:
            return [
                ...state,
                action.status
            ]
        
        /*case 'TOGGLE_TODO':
            return state.map(todo =>
                (todo.id === action.id) 
                    ? {...todo, completed: !todo.completed}
                    : todo
            )*/
        
        default:
            return state
        
    }
    
}

export default app
