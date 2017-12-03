import {
    SET_ONLINE
} from '../action-types'

/*export const setStatus = online => ({
    type: 'SET_ONLINE',
    online
})*/

export const setOnline = online => dispatch => {
    console.log('DISPATCH', SET_ONLINE, `payload: ${online}`)
    dispatch({
        type: SET_ONLINE,
        payload: online
    })
}
