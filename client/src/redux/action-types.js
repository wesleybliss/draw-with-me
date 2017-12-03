
/********************************************************************
 * App
 *******************************************************************/

/**
 * If the app (websocket) is online (has connected)
 * @type {String}
 */
export const SET_ONLINE = 'SET_ONLINE'


/********************************************************************
 * Chat
 *******************************************************************/

/**
 * If the chat has started (user entered a nickname & clicked "start")
 * @type {String}
 */
export const SET_STARTED = 'SET_STARTED'

/**
 * WebSocket instance
 * @type {String}
 */
export const SET_WS = 'SET_WS'

/**
 * WebSocket error, if any
 * @type {String}
 */
export const SET_WS_ERROR = 'SET_WS_ERROR'

/**
 * User's nickname
 * @type {String}
 */
export const SET_NICKNAME = 'SET_NICKNAME'

/**
 * Roster of connected users
 * Note: here we do a full replace - may not be very efficient,
 *       but seeing as this is an MVP, we shouldn't have too many users at once
 * @type {String}
 */
export const SET_ROSTER = 'SET_ROSTER'

/**
 * Add entry to conversation history
 * @type {String}
 */
export const ADD_HISTORY = 'ADD_HISTORY'
