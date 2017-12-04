import { createSelector } from 'reselect'

export const wsSelector = state => state.app.ws
export const wsErrorSelector = state => state.app.wsError
export const nicknameSelector = state => state.app.nickname
export const onlineSelector = state => state.app.online

export const chatSelector = state => state.chat
