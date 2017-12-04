import {
    SET_WS,
    SET_WS_ERROR,
    SET_ONLINE,
    SET_NICKNAME
} from '../action-types'

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

export const setOnline = online => dispatch => {
    console.log('DISPATCH', SET_ONLINE, `payload: ${online}`)
    dispatch({
        type: SET_ONLINE,
        payload: online
    })
}

export const setNickname = nickname => dispatch => {
    console.log('DISPATCH', SET_NICKNAME, `payload: ${nickname}`)
    dispatch({
        type: SET_NICKNAME,
        payload: nickname
    })
}
