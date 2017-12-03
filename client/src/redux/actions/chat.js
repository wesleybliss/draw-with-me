import {
    SET_STARTED,
    SET_WS,
    SET_WS_ERROR,
    SET_NICKNAME
} from '../action-types'

export const setStarted = started => dispatch => {
    console.log('DISPATCH', SET_STARTED, `payload: ${started}`)
    dispatch({
        type: SET_STARTED,
        payload: started
    })
}

export const setWs = ws => dispatch => {
    console.log('DISPATCH', SET_WS, `payload: ${ws}`)
    dispatch({
        type: SET_WS,
        payload: ws
    })
}

export const setWsError = wsError => dispatch => {
    console.log('DISPATCH', SET_WS_ERROR, `payload: ${wsError}`)
    dispatch({
        type: SET_WS_ERROR,
        payload: wsError
    })
}

export const setNickname = nickname => dispatch => {
    console.log('DISPATCH', SET_NICKNAME, `payload: ${nickname}`)
    dispatch({
        type: SET_NICKNAME,
        payload: nickname
    })
}
