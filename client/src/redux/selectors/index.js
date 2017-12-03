import { createSelector } from 'reselect'

export const onlineSelector = state => state.app.online

export const chatSelector = state => state.chat
