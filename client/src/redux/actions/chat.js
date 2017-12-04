import {
    SET_STARTED,
    SET_ROSTER,
    ADD_HISTORY
} from '../action-types'

export const setStarted = started => dispatch => {
    console.log('DISPATCH', SET_STARTED, `payload: ${started}`)
    dispatch({
        type: SET_STARTED,
        payload: started
    })
}

export const setRoster = roster => dispatch => {
    console.log('DISPATCH', SET_ROSTER, roster)
    dispatch({
        type: SET_ROSTER,
        payload: roster
    })
}

export const addHistory = entry => dispatch => {
    console.log('DISPATCH', ADD_HISTORY, `payload: ${entry}`)
    dispatch({
        type: ADD_HISTORY,
        payload: entry
    })
}
